--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13 (Debian 15.13-1.pgdg120+1)
-- Dumped by pg_dump version 15.13 (Debian 15.13-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: delete_cash_entry(integer, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_cash_entry(p_id integer, p_gstin text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    deleted_amount NUMERIC;
    is_bank_val BOOLEAN;
BEGIN
    SELECT amount, is_bank INTO deleted_amount, is_bank_val FROM cash WHERE id = p_id;

    DELETE FROM cash WHERE id = p_id;

    PERFORM log_journal_entry(
        p_gstin := p_gstin,
        p_entry_type := 'cash_delete',
        p_amount := deleted_amount,
        p_linked_row_id := p_id::TEXT,
        p_is_bank := is_bank_val
    );
END;
$$;


ALTER FUNCTION public.delete_cash_entry(p_id integer, p_gstin text) OWNER TO postgres;

--
-- Name: log_journal_entry(text, text, numeric, text, date, text, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_journal_entry(p_gstin text, p_entry_type text, p_amount numeric DEFAULT NULL::numeric, p_remark_id text DEFAULT NULL::text, p_dated date DEFAULT CURRENT_DATE, p_linked_row_id text DEFAULT NULL::text, p_is_bank boolean DEFAULT false) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    actual_amount NUMERIC;
BEGIN
    -- If amount is not provided, try fetching from related table
    IF p_amount IS NULL THEN
        CASE p_entry_type
            WHEN 'cash' THEN
                SELECT amount INTO actual_amount FROM cash WHERE id = p_linked_row_id::INT;
            WHEN 'stock' THEN
                SELECT weight INTO actual_amount FROM stock WHERE id = p_linked_row_id::INT;
            WHEN 'gold' THEN
                SELECT weight INTO actual_amount FROM gold WHERE id = p_linked_row_id::INT;
            WHEN 'bill' THEN
                SELECT weight * rate INTO actual_amount FROM bill WHERE id = p_linked_row_id::INT;
            ELSE
                RAISE EXCEPTION 'Unknown entry_type or amount missing';
        END CASE;
    ELSE
        actual_amount := p_amount;
    END IF;

    -- Insert into journal
    INSERT INTO journal_entry (
        gstin, entry_type, amount, remark_id, dated, linked_row_id, is_bank
    )
    VALUES (
        p_gstin, p_entry_type, actual_amount, p_remark_id, p_dated, p_linked_row_id, p_is_bank
    );
END;
$$;


ALTER FUNCTION public.log_journal_entry(p_gstin text, p_entry_type text, p_amount numeric, p_remark_id text, p_dated date, p_linked_row_id text, p_is_bank boolean) OWNER TO postgres;

--
-- Name: unified_insert_journal_entry(character varying, character varying, date, boolean, text, text, text, numeric, numeric, numeric, numeric, numeric, numeric, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.unified_insert_journal_entry(p_entry_type character varying, p_gstin character varying, p_dated date DEFAULT CURRENT_DATE, p_bank boolean DEFAULT false, p_remark_text text DEFAULT NULL::text, p_bill_no text DEFAULT NULL::text, p_purity text DEFAULT NULL::text, p_wt numeric DEFAULT NULL::numeric, p_rate numeric DEFAULT NULL::numeric, p_cgst numeric DEFAULT NULL::numeric, p_sgst numeric DEFAULT NULL::numeric, p_igst numeric DEFAULT NULL::numeric, p_weight numeric DEFAULT NULL::numeric, p_cash_amount numeric DEFAULT NULL::numeric) RETURNS TABLE(journal_ts timestamp without time zone, returned_entry_type character varying, returned_entry_id integer, returned_amount numeric, returned_remark_id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_entry_id INT;
    v_amount NUMERIC;
    v_remark INT;
BEGIN
    RAISE NOTICE 'Starting unified_insert_journal_entry with entry_type = %, gstin = %', p_entry_type, p_gstin;

    -- Insert remark if provided
    IF p_remark_text IS NOT NULL THEN
        RAISE NOTICE 'Inserting into remarks: %', p_remark_text;
        INSERT INTO remarks (gstin, remark)
        VALUES (p_gstin, p_remark_text)
        RETURNING remark_id INTO v_remark;
        RAISE NOTICE 'Inserted remark_id = %', v_remark;
    END IF;

    CASE 
        WHEN p_entry_type = 'bill' THEN
            RAISE NOTICE 'Inserting bill with bill_no = %, wt = %, rate = %', p_bill_no, p_wt, p_rate;
            INSERT INTO bill (bill_no, gstin, purity, wt, rate, dated, bank)
            VALUES (p_bill_no, p_gstin, p_purity, p_wt, p_rate, p_dated, p_bank)
            RETURNING id INTO v_entry_id;
            v_amount := p_wt * p_rate;
            RAISE NOTICE 'Inserted bill id = %, amount = %', v_entry_id, v_amount;

        WHEN p_entry_type = 'cash' THEN
            INSERT INTO cash (gstin, amount, dated, bank)
            VALUES (p_gstin, p_cash_amount, p_dated, p_bank)
            RETURNING id INTO v_entry_id;
            v_amount := p_cash_amount;

        WHEN p_entry_type = 'stock' OR p_entry_type = 'gold' THEN
            INSERT INTO stock (gstin, purity, weight, dated, bank)
            VALUES (p_gstin, p_purity, p_weight, p_dated, p_bank)
            RETURNING id INTO v_entry_id;
            v_amount := p_weight;

        WHEN p_entry_type = 'remarks' THEN
            v_entry_id := v_remark;
            v_amount := NULL;

        ELSE
            RAISE EXCEPTION 'Unknown entry_type: %', p_entry_type;
    END CASE;

    RAISE NOTICE 'Inserting into journal: entry_id = %, amount = %', v_entry_id, v_amount;

    RETURN QUERY
    INSERT INTO journal (
        timestamp, gstin, entry_type, entry_id,
        amount, dated, bank, remark_id
    )
    VALUES (
        NOW(), p_gstin, p_entry_type, v_entry_id,
        v_amount, p_dated, p_bank, v_remark
    )
    RETURNING
        timestamp,
        entry_type,
        entry_id,
        amount,
        remark_id;

END;
$$;


ALTER FUNCTION public.unified_insert_journal_entry(p_entry_type character varying, p_gstin character varying, p_dated date, p_bank boolean, p_remark_text text, p_bill_no text, p_purity text, p_wt numeric, p_rate numeric, p_cgst numeric, p_sgst numeric, p_igst numeric, p_weight numeric, p_cash_amount numeric) OWNER TO postgres;

--
-- Name: update_cash_entry(integer, numeric, boolean, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_cash_entry(p_id integer, p_amount numeric, p_is_bank boolean, p_gstin text) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE cash
    SET amount = p_amount, is_bank = p_is_bank
    WHERE id = p_id;

    PERFORM log_journal_entry(
        p_gstin := p_gstin,
        p_entry_type := 'cash',
        p_amount := p_amount,
        p_linked_row_id := p_id::TEXT,
        p_is_bank := p_is_bank
    );
END;
$$;


ALTER FUNCTION public.update_cash_entry(p_id integer, p_amount numeric, p_is_bank boolean, p_gstin text) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bill; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bill (
    id integer NOT NULL,
    bill_no character varying(20) NOT NULL,
    gstin character varying(15) NOT NULL,
    purity character varying(10) NOT NULL,
    wt numeric(10,3) NOT NULL,
    rate numeric(10,2) NOT NULL,
    cgst_rate numeric(5,2) DEFAULT 0,
    sgst_rate numeric(5,2) DEFAULT 0,
    igst_rate numeric(5,2) DEFAULT 0,
    dated date DEFAULT CURRENT_DATE,
    bank boolean DEFAULT false,
    cgst numeric DEFAULT 0,
    sgst numeric DEFAULT 0,
    igst numeric DEFAULT 0
);


ALTER TABLE public.bill OWNER TO postgres;

--
-- Name: bill_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bill_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.bill_id_seq OWNER TO postgres;

--
-- Name: bill_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bill_id_seq OWNED BY public.bill.id;


--
-- Name: cash; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cash (
    id integer NOT NULL,
    dated date NOT NULL,
    gstin character varying(15) NOT NULL,
    amount numeric(12,2),
    bank boolean DEFAULT false
);


ALTER TABLE public.cash OWNER TO postgres;

--
-- Name: cash_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cash_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cash_id_seq OWNER TO postgres;

--
-- Name: cash_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cash_id_seq OWNED BY public.cash.id;


--
-- Name: customer_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_details (
    gstin character varying(15) NOT NULL,
    name character varying(100),
    address text,
    phone character varying(15),
    email character varying(100)
);


ALTER TABLE public.customer_details OWNER TO postgres;

--
-- Name: gold; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gold (
    id integer NOT NULL,
    dated date,
    gstin text NOT NULL,
    purity text NOT NULL,
    weight numeric DEFAULT 0,
    is_bank boolean DEFAULT false
);


ALTER TABLE public.gold OWNER TO postgres;

--
-- Name: gold_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gold_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.gold_id_seq OWNER TO postgres;

--
-- Name: gold_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gold_id_seq OWNED BY public.gold.id;


--
-- Name: journal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journal (
    "timestamp" timestamp without time zone NOT NULL,
    gstin character varying(15) NOT NULL,
    entry_type character varying(20) NOT NULL,
    amount numeric(12,2),
    remark_id integer,
    dated date,
    bank boolean DEFAULT false,
    entry_id integer,
    CONSTRAINT journal_entry_type_check CHECK (((entry_type)::text = ANY (ARRAY[('stock'::character varying)::text, ('gold'::character varying)::text, ('bill'::character varying)::text, ('remarks'::character varying)::text, ('cash'::character varying)::text])))
);


ALTER TABLE public.journal OWNER TO postgres;

--
-- Name: journal_entry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journal_entry (
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    gstin text NOT NULL,
    entry_type text NOT NULL,
    amount numeric,
    remark_id text,
    dated date,
    linked_row_id text,
    is_bank boolean DEFAULT false
);


ALTER TABLE public.journal_entry OWNER TO postgres;

--
-- Name: remarks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.remarks (
    remark_id integer NOT NULL,
    gstin character varying(15),
    remark text
);


ALTER TABLE public.remarks OWNER TO postgres;

--
-- Name: remarks_remark_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.remarks_remark_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.remarks_remark_id_seq OWNER TO postgres;

--
-- Name: remarks_remark_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.remarks_remark_id_seq OWNED BY public.remarks.remark_id;


--
-- Name: stock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock (
    id integer NOT NULL,
    dated date,
    gstin character varying(15) NOT NULL,
    purity character varying(10) DEFAULT '75ct'::character varying NOT NULL,
    weight numeric(10,3) DEFAULT 0 NOT NULL,
    bank boolean DEFAULT false
);


ALTER TABLE public.stock OWNER TO postgres;

--
-- Name: stock_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.stock_id_seq OWNER TO postgres;

--
-- Name: stock_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_id_seq OWNED BY public.stock.id;


--
-- Name: bill id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill ALTER COLUMN id SET DEFAULT nextval('public.bill_id_seq'::regclass);


--
-- Name: cash id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cash ALTER COLUMN id SET DEFAULT nextval('public.cash_id_seq'::regclass);


--
-- Name: gold id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gold ALTER COLUMN id SET DEFAULT nextval('public.gold_id_seq'::regclass);


--
-- Name: remarks remark_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.remarks ALTER COLUMN remark_id SET DEFAULT nextval('public.remarks_remark_id_seq'::regclass);


--
-- Name: stock id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock ALTER COLUMN id SET DEFAULT nextval('public.stock_id_seq'::regclass);


--
-- Name: bill bill_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill
    ADD CONSTRAINT bill_pkey PRIMARY KEY (id);


--
-- Name: cash cash_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cash
    ADD CONSTRAINT cash_pkey PRIMARY KEY (id);


--
-- Name: customer_details customer_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_details
    ADD CONSTRAINT customer_details_pkey PRIMARY KEY (gstin);


--
-- Name: gold gold_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gold
    ADD CONSTRAINT gold_pkey PRIMARY KEY (id);


--
-- Name: journal_entry journal_entry_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entry
    ADD CONSTRAINT journal_entry_pkey PRIMARY KEY ("timestamp");


--
-- Name: journal journal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal
    ADD CONSTRAINT journal_pkey PRIMARY KEY ("timestamp");


--
-- Name: remarks remarks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.remarks
    ADD CONSTRAINT remarks_pkey PRIMARY KEY (remark_id);


--
-- Name: stock stock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT stock_pkey PRIMARY KEY (id);


--
-- Name: bill bill_gstin_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill
    ADD CONSTRAINT bill_gstin_fkey FOREIGN KEY (gstin) REFERENCES public.customer_details(gstin);


--
-- Name: cash cash_gstin_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cash
    ADD CONSTRAINT cash_gstin_fkey FOREIGN KEY (gstin) REFERENCES public.customer_details(gstin);


--
-- Name: journal journal_gstin_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal
    ADD CONSTRAINT journal_gstin_fkey FOREIGN KEY (gstin) REFERENCES public.customer_details(gstin);


--
-- Name: journal journal_remark_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal
    ADD CONSTRAINT journal_remark_id_fkey FOREIGN KEY (remark_id) REFERENCES public.remarks(remark_id);


--
-- Name: remarks remarks_gstin_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.remarks
    ADD CONSTRAINT remarks_gstin_fkey FOREIGN KEY (gstin) REFERENCES public.customer_details(gstin);


--
-- Name: stock stock_gstin_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT stock_gstin_fkey FOREIGN KEY (gstin) REFERENCES public.customer_details(gstin);


--
-- PostgreSQL database dump complete
--

