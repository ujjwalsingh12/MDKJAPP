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
-- Name: delete_cash_entry(integer, text, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_cash_entry(p_id integer, p_gstin text, p_is_debit boolean) RETURNS void
    LANGUAGE plpgsql
    AS $$

DECLARE

    deleted_amount NUMERIC;

    is_bank_val BOOLEAN;

BEGIN

    SELECT amount, bank INTO deleted_amount, is_bank_val FROM cash WHERE id = p_id;



    DELETE FROM cash WHERE id = p_id;



    PERFORM log_journal_entry(

        p_gstin := p_gstin,

        p_entry_type := 'cash_delete',

        p_is_debit := p_is_debit,

        p_amount := deleted_amount,

        p_linked_row_id := p_id::TEXT,

        p_is_bank := is_bank_val

    );

END;

$$;


ALTER FUNCTION public.delete_cash_entry(p_id integer, p_gstin text, p_is_debit boolean) OWNER TO postgres;

--
-- Name: log_journal_entry(text, text, boolean, numeric, text, date, text, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_journal_entry(p_gstin text, p_entry_type text, p_is_debit boolean, p_amount numeric DEFAULT NULL::numeric, p_remark_id text DEFAULT NULL::text, p_dated date DEFAULT CURRENT_DATE, p_linked_row_id text DEFAULT NULL::text, p_is_bank boolean DEFAULT false) RETURNS void
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



    -- Insert into journal_entry

    INSERT INTO journal_entry (

        gstin, entry_type, amount, remark_id, dated, linked_row_id, is_bank, is_debit

    )

    VALUES (

        p_gstin, p_entry_type, actual_amount, p_remark_id, p_dated, p_linked_row_id, p_is_bank, p_is_debit

    );

END;

$$;


ALTER FUNCTION public.log_journal_entry(p_gstin text, p_entry_type text, p_is_debit boolean, p_amount numeric, p_remark_id text, p_dated date, p_linked_row_id text, p_is_bank boolean) OWNER TO postgres;

--
-- Name: unified_delete_journal_entry(character varying, integer, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.unified_delete_journal_entry(p_entry_type character varying, p_entry_id integer, p_remark_text text DEFAULT NULL::text) RETURNS TABLE(journal_ts timestamp without time zone, returned_entry_type character varying, returned_entry_id integer, returned_amount numeric, returned_remark_id integer, returned_is_debit boolean)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_amount NUMERIC;
    v_is_debit BOOLEAN;
    v_gstin VARCHAR;
    v_bank BOOLEAN;
    v_dated DATE;
BEGIN
    -- Normalize entry type
    p_entry_type := LOWER(TRIM(p_entry_type));

    -- Validation
    IF p_entry_type IS NULL OR p_entry_id IS NULL THEN
        RAISE EXCEPTION 'entry_type and entry_id are required';
    END IF;

    -- Fetch related data for journal logging before deletion
    CASE p_entry_type
        WHEN 'bill' THEN
            SELECT gstin, wt * rate, is_debit, bank, dated INTO v_gstin, v_amount, v_is_debit, v_bank, v_dated
            FROM bill WHERE id = p_entry_id;

            DELETE FROM bill WHERE id = p_entry_id;

        WHEN 'cash' THEN
            SELECT gstin, cash_amount, is_debit, bank, dated INTO v_gstin, v_amount, v_is_debit, v_bank, v_dated
            FROM cash WHERE id = p_entry_id;

            DELETE FROM cash WHERE id = p_entry_id;

        WHEN 'stock' THEN
            SELECT gstin, weight, is_debit, bank, dated INTO v_gstin, v_amount, v_is_debit, v_bank, v_dated
            FROM stock WHERE id = p_entry_id;

            DELETE FROM stock WHERE id = p_entry_id;

        WHEN 'gold' THEN
            SELECT gstin, weight, is_debit, is_bank, dated INTO v_gstin, v_amount, v_is_debit, v_bank, v_dated
            FROM gold WHERE id = p_entry_id;

            DELETE FROM gold WHERE id = p_entry_id;

        ELSE
            RAISE EXCEPTION 'Unsupported entry_type for deletion: %', p_entry_type;
    END CASE;

    -- Insert into journal for deletion logging
    INSERT INTO journal (
        gstin, entry_type, entry_id,
        amount, dated, bank, remark_id, is_debit
    ) VALUES (
        v_gstin, p_entry_type, p_entry_id,
        v_amount, v_dated, v_bank, NULL, v_is_debit
    )
    RETURNING id AS journal_ts, entry_type, entry_id, amount, remark_id, is_debit
    INTO journal_ts, returned_entry_type, returned_entry_id,
         returned_amount, returned_remark_id, returned_is_debit;

    RETURN NEXT;
END;
$$;


ALTER FUNCTION public.unified_delete_journal_entry(p_entry_type character varying, p_entry_id integer, p_remark_text text) OWNER TO postgres;

--
-- Name: unified_insert_journal_entry(character varying, character varying, boolean, date, boolean, text, text, text, numeric, numeric, numeric, numeric, numeric, numeric, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.unified_insert_journal_entry(p_entry_type character varying, p_gstin character varying, p_is_debit boolean, p_dated date DEFAULT CURRENT_DATE, p_bank boolean DEFAULT false, p_remark_text text DEFAULT NULL::text, p_bill_no text DEFAULT NULL::text, p_purity text DEFAULT NULL::text, p_wt numeric DEFAULT NULL::numeric, p_rate numeric DEFAULT NULL::numeric, p_cgst numeric DEFAULT NULL::numeric, p_sgst numeric DEFAULT NULL::numeric, p_igst numeric DEFAULT NULL::numeric, p_weight numeric DEFAULT NULL::numeric, p_cash_amount numeric DEFAULT NULL::numeric) RETURNS TABLE(journal_ts timestamp without time zone, returned_entry_type character varying, returned_entry_id integer, returned_amount numeric, returned_remark_id integer, returned_is_debit boolean)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_entry_id INT;
    v_amount NUMERIC;
    v_remark INT := NULL;
    v_function_start_time TIMESTAMP;
    v_step_counter INT := 0;
    v_error_context TEXT;
BEGIN
    -- Initialize function timing and debugging
    v_function_start_time := clock_timestamp();
    v_step_counter := v_step_counter + 1;
    
    RAISE NOTICE '[STEP %] Function started at % with entry_type=%, gstin=%, is_debit=%', 
        v_step_counter, v_function_start_time, p_entry_type, p_gstin, p_is_debit;
    
    -- Input validation
    v_step_counter := v_step_counter + 1;
    RAISE NOTICE '[STEP %] Starting input validation', v_step_counter;
    
    -- Validate required parameters
    IF p_entry_type IS NULL OR TRIM(p_entry_type) = '' THEN
        RAISE EXCEPTION 'entry_type cannot be null or empty';
    END IF;
    
    IF p_gstin IS NULL OR TRIM(p_gstin) = '' THEN
        RAISE EXCEPTION 'gstin cannot be null or empty';
    END IF;
    
    IF p_is_debit IS NULL THEN
        RAISE EXCEPTION 'is_debit cannot be null - must specify true for debit or false for credit';
    END IF;
    
    -- Normalize entry_type to lowercase for consistent comparison
    p_entry_type := LOWER(TRIM(p_entry_type));
    
    RAISE NOTICE '[STEP %] Input validation passed. Normalized entry_type: %, is_debit: %', 
        v_step_counter, p_entry_type, p_is_debit;
    
    -- Validate entry_type specific requirements
    v_step_counter := v_step_counter + 1;
    -- Validate entry_type
IF p_entry_type NOT IN ('bill', 'cash', 'stock', 'gold', 'remarks') THEN
    RAISE EXCEPTION 'Invalid p_entry_type received: %', p_entry_type;
END IF;

RAISE NOTICE '[DEBUG] Normalized entry_type is: %', p_entry_type;

-- Validate entry_type specific requirements
v_step_counter := v_step_counter + 1;
RAISE NOTICE '[STEP %] Validating entry_type specific requirements', v_step_counter;

CASE p_entry_type
    WHEN 'bill' THEN
        IF p_bill_no IS NULL OR TRIM(p_bill_no) = '' THEN
            RAISE EXCEPTION 'bill_no is required for bill entries';
        END IF;
        IF p_wt IS NULL OR p_wt <= 0 THEN
            RAISE EXCEPTION 'weight (wt) must be positive for bill entries';
        END IF;
        IF p_rate IS NULL OR p_rate <= 0 THEN
            RAISE EXCEPTION 'rate must be positive for bill entries';
        END IF;

    WHEN 'cash' THEN
        IF p_cash_amount IS NULL OR p_cash_amount = 0 THEN
            RAISE EXCEPTION 'cash_amount is required and must be non-zero for cash entries';
        END IF;

    WHEN 'stock' THEN
        IF p_weight IS NULL OR p_weight <= 0 THEN
            RAISE EXCEPTION 'weight must be positive for stock entries';
        END IF;

    WHEN 'gold' THEN
        IF p_weight IS NULL OR p_weight <= 0 THEN
            RAISE EXCEPTION 'weight must be positive for gold entries';
        END IF;

    WHEN 'remarks' THEN
        IF p_remark_text IS NULL OR TRIM(p_remark_text) = '' THEN
            RAISE EXCEPTION 'remark_text is required for remarks entries';
        END IF;
END CASE;

RAISE NOTICE '[STEP %] Entry type validation passed for: %', v_step_counter, p_entry_type;
    -- Handle remark insertion
    IF p_remark_text IS NOT NULL AND TRIM(p_remark_text) != '' THEN
        v_step_counter := v_step_counter + 1;
        RAISE NOTICE '[STEP %] Inserting remark: %', v_step_counter, p_remark_text;
        
        BEGIN
            INSERT INTO remarks (gstin, remark)
            VALUES (p_gstin, TRIM(p_remark_text))
            RETURNING remark_id INTO v_remark;
            
            RAISE NOTICE '[STEP %] Successfully inserted remark with ID: %', v_step_counter, v_remark;
        EXCEPTION
            WHEN OTHERS THEN
                v_error_context := 'Error inserting remark';
                RAISE EXCEPTION '% - SQLSTATE: %, Error: %', v_error_context, SQLSTATE, SQLERRM;
        END;
    ELSE
        RAISE NOTICE '[STEP %] No remark to insert', v_step_counter;
    END IF;
    
    -- Handle main entry insertion based on type
    v_step_counter := v_step_counter + 1;
    RAISE NOTICE '[STEP %] Starting main entry insertion for type: %', v_step_counter, p_entry_type;
    
    BEGIN
        CASE p_entry_type
    WHEN 'bill' THEN
        RAISE NOTICE '[STEP %] Inserting bill: bill_no=%, purity=%, wt=%, rate=%, dated=%, bank=%, is_debit=%', 
            v_step_counter, p_bill_no, p_purity, p_wt, p_rate, p_dated, p_bank, p_is_debit;

        INSERT INTO bill (bill_no, gstin, purity, wt, rate, dated, bank, is_debit)
        VALUES (TRIM(p_bill_no), p_gstin, p_purity, p_wt, p_rate, p_dated, p_bank, p_is_debit)
        RETURNING id INTO v_entry_id;

        v_amount := p_wt * p_rate;
        RAISE NOTICE '[STEP %] Bill inserted successfully: id=%, calculated_amount=%, is_debit=%', 
            v_step_counter, v_entry_id, v_amount, p_is_debit;

    WHEN 'cash' THEN
        RAISE NOTICE '[STEP %] Inserting cash: amount=%, dated=%, bank=%, is_debit=%', 
            v_step_counter, p_cash_amount, p_dated, p_bank, p_is_debit;

        INSERT INTO cash (gstin, amount, dated, bank, is_debit)
        VALUES (p_gstin, p_cash_amount, p_dated, p_bank, p_is_debit)
        RETURNING id INTO v_entry_id;

        v_amount := p_cash_amount;
        RAISE NOTICE '[STEP %] Cash inserted successfully: id=%, amount=%, is_debit=%', 
            v_step_counter, v_entry_id, v_amount, p_is_debit;

    WHEN 'stock' THEN
        RAISE NOTICE '[STEP %] Inserting into STOCK table: purity=%, weight=%, dated=%, bank=%, is_debit=%', 
            v_step_counter, p_purity, p_weight, p_dated, p_bank, p_is_debit;

        INSERT INTO stock (gstin, purity, weight, dated, bank, is_debit)
        VALUES (p_gstin, p_purity, p_weight, p_dated, p_bank, p_is_debit)
        RETURNING id INTO v_entry_id;

        v_amount := p_weight;
        RAISE NOTICE '[STEP %] Stock inserted successfully: id=%, weight=%, is_debit=%', 
            v_step_counter, v_entry_id, v_amount, p_is_debit;

    WHEN 'gold' THEN
        RAISE NOTICE '[STEP %] Inserting into GOLD table: purity=%, weight=%, dated=%, bank=%, is_debit=%', 
            v_step_counter, p_purity, p_weight, p_dated, p_bank, p_is_debit;

        INSERT INTO gold (gstin, purity, weight, dated, is_bank, is_debit)
        VALUES (p_gstin, p_purity, p_weight, p_dated, p_bank, p_is_debit)
        RETURNING id INTO v_entry_id;

        v_amount := p_weight;
        RAISE NOTICE '[STEP %] Gold inserted successfully: id=%, weight=%, is_debit=%', 
            v_step_counter, v_entry_id, v_amount, p_is_debit;

    WHEN 'remarks' THEN
        RAISE NOTICE '[STEP %] Processing remarks entry', v_step_counter;
        v_entry_id := v_remark;
        v_amount := NULL;
        RAISE NOTICE '[STEP %] Remarks entry processed: entry_id=%, amount=%', 
            v_step_counter, v_entry_id, v_amount;
END CASE;
        
    EXCEPTION
        WHEN unique_violation THEN
            v_error_context := FORMAT('Unique constraint violation for %s entry', p_entry_type);
            RAISE EXCEPTION '% - Duplicate entry detected. SQLSTATE: %, Error: %', 
                v_error_context, SQLSTATE, SQLERRM;
        WHEN foreign_key_violation THEN
            v_error_context := FORMAT('Foreign key violation for %s entry', p_entry_type);
            RAISE EXCEPTION '% - Referenced record does not exist. SQLSTATE: %, Error: %', 
                v_error_context, SQLSTATE, SQLERRM;
        WHEN check_violation THEN
            v_error_context := FORMAT('Check constraint violation for %s entry', p_entry_type);
            RAISE EXCEPTION '% - Data violates table constraints. SQLSTATE: %, Error: %', 
                v_error_context, SQLSTATE, SQLERRM;
        WHEN OTHERS THEN
            v_error_context := FORMAT('Unexpected error inserting %s entry', p_entry_type);
            RAISE EXCEPTION '% - SQLSTATE: %, Error: %', v_error_context, SQLSTATE, SQLERRM;
    END;
    
    -- Validate that we have a valid entry_id
    IF v_entry_id IS NULL THEN
        RAISE EXCEPTION 'Failed to generate entry_id for % entry', p_entry_type;
    END IF;
    
    -- Insert into journal table
    v_step_counter := v_step_counter + 1;
    RAISE NOTICE '[STEP %] Inserting into journal: entry_type=%, entry_id=%, amount=%, remark_id=%, is_debit=%', 
        v_step_counter, p_entry_type, v_entry_id, v_amount, v_remark, p_is_debit;
    
    BEGIN
        RETURN QUERY
        INSERT INTO journal (
            id, gstin, entry_type, entry_id,
            amount, dated, bank, remark_id, is_debit
        )
        VALUES (
            NOW()+(random() * interval '1 millisecond'), p_gstin, p_entry_type, v_entry_id,
            v_amount, p_dated, p_bank, v_remark, p_is_debit
        )
        RETURNING
            id,
            entry_type,
            entry_id,
            amount,
            remark_id,
            is_debit;
        
        v_step_counter := v_step_counter + 1;
        RAISE NOTICE '[STEP %] Journal entry inserted successfully with is_debit=%', v_step_counter, p_is_debit;
        
    EXCEPTION
        WHEN OTHERS THEN
            v_error_context := 'Error inserting journal entry';
            RAISE EXCEPTION '% - SQLSTATE: %, Error: %', v_error_context, SQLSTATE, SQLERRM;
    END;
    
    -- Function completion
    v_step_counter := v_step_counter + 1;
    RAISE NOTICE '[STEP %] Function completed successfully in % ms', 
        v_step_counter, 
        EXTRACT(MILLISECONDS FROM (clock_timestamp() - v_function_start_time));
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error with full context
        RAISE NOTICE '[ERROR] Function failed at step % after % ms. Context: %', 
            v_step_counter,
            EXTRACT(MILLISECONDS FROM (clock_timestamp() - v_function_start_time)),
            COALESCE(v_error_context, 'Unknown error location');
        
        -- Re-raise the exception with additional context
        RAISE EXCEPTION 'unified_insert_journal_entry failed: %', SQLERRM;
END;
$$;


ALTER FUNCTION public.unified_insert_journal_entry(p_entry_type character varying, p_gstin character varying, p_is_debit boolean, p_dated date, p_bank boolean, p_remark_text text, p_bill_no text, p_purity text, p_wt numeric, p_rate numeric, p_cgst numeric, p_sgst numeric, p_igst numeric, p_weight numeric, p_cash_amount numeric) OWNER TO postgres;

--
-- Name: unified_update_journal_entry(character varying, integer, boolean, date, boolean, text, text, text, numeric, numeric, numeric, numeric, numeric, numeric, numeric, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.unified_update_journal_entry(p_entry_type character varying, p_entry_id integer, p_is_debit boolean DEFAULT NULL::boolean, p_dated date DEFAULT NULL::date, p_bank boolean DEFAULT NULL::boolean, p_remark_text text DEFAULT NULL::text, p_bill_no text DEFAULT NULL::text, p_purity text DEFAULT NULL::text, p_wt numeric DEFAULT NULL::numeric, p_rate numeric DEFAULT NULL::numeric, p_cgst numeric DEFAULT NULL::numeric, p_sgst numeric DEFAULT NULL::numeric, p_igst numeric DEFAULT NULL::numeric, p_weight numeric DEFAULT NULL::numeric, p_cash_amount numeric DEFAULT NULL::numeric, p_gstin character varying DEFAULT NULL::character varying) RETURNS TABLE(journal_ts timestamp without time zone, returned_entry_type character varying, returned_entry_id integer, returned_amount numeric, returned_remark_id integer, returned_is_debit boolean)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_amount       NUMERIC;
    v_remark_id    INTEGER;
    v_bill_wt      NUMERIC;
    v_bill_rate    NUMERIC;
    v_existing_gstin VARCHAR;
    v_existing_is_debit BOOLEAN;
    v_existing_dated DATE;
    v_existing_bank BOOLEAN;
BEGIN
    -- Normalize entry_type
    p_entry_type := LOWER(TRIM(p_entry_type));

    -- Validate minimum required
    IF p_entry_type IS NULL OR p_entry_id IS NULL THEN
        RAISE EXCEPTION 'entry_type and entry_id are required';
    END IF;

    -- Optional remark insert
    IF p_remark_text IS NOT NULL AND LENGTH(TRIM(p_remark_text)) > 0 THEN
        INSERT INTO remarks(gstin, remark)
        VALUES (COALESCE(p_gstin, ''), p_remark_text)
        RETURNING remark_id INTO v_remark_id;
    END IF;

    -- Handle entry-specific update
    CASE p_entry_type
        WHEN 'bill' THEN
            SELECT gstin, is_debit, dated, bank, wt, rate
            INTO v_existing_gstin, v_existing_is_debit, v_existing_dated, v_existing_bank, v_bill_wt, v_bill_rate
            FROM bill WHERE id = p_entry_id;

            UPDATE bill
            SET bill_no = COALESCE(p_bill_no, bill_no),
                purity = COALESCE(p_purity, purity),
                wt     = COALESCE(p_wt, wt),
                rate   = COALESCE(p_rate, rate),
                cgst   = COALESCE(p_cgst, cgst),
                sgst   = COALESCE(p_sgst, sgst),
                igst   = COALESCE(p_igst, igst),
                dated  = COALESCE(p_dated, dated),
                bank   = COALESCE(p_bank, bank)
            WHERE id = p_entry_id;

            v_amount := COALESCE(p_wt, v_bill_wt) * COALESCE(p_rate, v_bill_rate);

        WHEN 'cash' THEN
            SELECT gstin, is_debit, dated, bank
            INTO v_existing_gstin, v_existing_is_debit, v_existing_dated, v_existing_bank
            FROM cash WHERE id = p_entry_id;

            UPDATE cash
            SET cash_amount = COALESCE(p_cash_amount, cash_amount),
                dated       = COALESCE(p_dated, dated),
                bank        = COALESCE(p_bank, bank)
            WHERE id = p_entry_id;

            v_amount := COALESCE(p_cash_amount, 0);

        WHEN 'stock' THEN
            SELECT gstin, is_debit, dated, bank
            INTO v_existing_gstin, v_existing_is_debit, v_existing_dated, v_existing_bank
            FROM stock WHERE id = p_entry_id;

            UPDATE stock
            SET purity = COALESCE(p_purity, purity),
                weight = COALESCE(p_weight, weight),
                dated  = COALESCE(p_dated, dated),
                bank   = COALESCE(p_bank, bank)
            WHERE id = p_entry_id;

            v_amount := COALESCE(p_weight, 0);

        WHEN 'gold' THEN
            SELECT gstin, is_debit, dated, is_bank
            INTO v_existing_gstin, v_existing_is_debit, v_existing_dated, v_existing_bank
            FROM gold WHERE id = p_entry_id;

            UPDATE gold
            SET purity  = COALESCE(p_purity, purity),
                weight  = COALESCE(p_weight, weight),
                dated   = COALESCE(p_dated, dated),
                is_bank = COALESCE(p_bank, is_bank)
            WHERE id = p_entry_id;

            v_amount := COALESCE(p_weight, 0);

        WHEN 'remarks' THEN
            RAISE EXCEPTION 'remarks entries are immutable and cannot be updated';

        ELSE
            RAISE EXCEPTION 'Unsupported entry_type: %', p_entry_type;
    END CASE;

    -- Final fallback for values not passed in
    p_is_debit := COALESCE(p_is_debit, v_existing_is_debit);
    p_gstin    := COALESCE(p_gstin, v_existing_gstin);
    p_dated    := COALESCE(p_dated, v_existing_dated);
    p_bank     := COALESCE(p_bank, v_existing_bank);

    -- Journal insert
    INSERT INTO journal (
        gstin, entry_type, entry_id,
        amount, dated, bank, remark_id, is_debit
    )
    VALUES (
        p_gstin, p_entry_type, p_entry_id,
        v_amount, p_dated, p_bank, v_remark_id, p_is_debit
    )
    RETURNING id AS journal_ts, entry_type, entry_id, amount, remark_id, is_debit
    INTO journal_ts, returned_entry_type, returned_entry_id,
         returned_amount, returned_remark_id, returned_is_debit;

    RETURN NEXT;
END;
$$;


ALTER FUNCTION public.unified_update_journal_entry(p_entry_type character varying, p_entry_id integer, p_is_debit boolean, p_dated date, p_bank boolean, p_remark_text text, p_bill_no text, p_purity text, p_wt numeric, p_rate numeric, p_cgst numeric, p_sgst numeric, p_igst numeric, p_weight numeric, p_cash_amount numeric, p_gstin character varying) OWNER TO postgres;

--
-- Name: update_cash_entry(integer, numeric, boolean, text, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_cash_entry(p_id integer, p_amount numeric, p_is_bank boolean, p_gstin text, p_is_debit boolean) RETURNS void
    LANGUAGE plpgsql
    AS $$

BEGIN

    UPDATE cash

    SET amount = p_amount, bank = p_is_bank, is_debit = p_is_debit

    WHERE id = p_id;



    PERFORM log_journal_entry(

        p_gstin := p_gstin,

        p_entry_type := 'cash',

        p_is_debit := p_is_debit,

        p_amount := p_amount,

        p_linked_row_id := p_id::TEXT,

        p_is_bank := p_is_bank

    );

END;

$$;


ALTER FUNCTION public.update_cash_entry(p_id integer, p_amount numeric, p_is_bank boolean, p_gstin text, p_is_debit boolean) OWNER TO postgres;

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
    igst numeric DEFAULT 0,
    is_debit boolean
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
    amount numeric(12,2) DEFAULT 0,
    bank boolean DEFAULT false,
    is_debit boolean
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
    name character varying(100) NOT NULL,
    address text,
    phone character varying(15) DEFAULT NULL::character varying,
    email character varying(100) DEFAULT NULL::character varying
);


ALTER TABLE public.customer_details OWNER TO postgres;

--
-- Name: gold; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gold (
    id integer NOT NULL,
    dated date DEFAULT CURRENT_DATE NOT NULL,
    gstin text NOT NULL,
    purity text NOT NULL,
    weight numeric DEFAULT 0,
    is_bank boolean DEFAULT false,
    is_debit boolean
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
    id timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    gstin character varying(15) NOT NULL,
    entry_type character varying(20) NOT NULL,
    amount numeric(12,2) DEFAULT 0,
    remark_id integer,
    dated date DEFAULT CURRENT_DATE,
    bank boolean DEFAULT false,
    entry_id integer,
    is_debit boolean,
    CONSTRAINT journal_entry_type_check CHECK (((entry_type)::text = ANY (ARRAY[('stock'::character varying)::text, ('gold'::character varying)::text, ('bill'::character varying)::text, ('remarks'::character varying)::text, ('cash'::character varying)::text])))
);


ALTER TABLE public.journal OWNER TO postgres;

--
-- Name: journal_entry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journal_entry (
    id timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    gstin text NOT NULL,
    entry_type text NOT NULL,
    amount numeric,
    remark_id text,
    dated date,
    linked_row_id text,
    is_bank boolean DEFAULT false,
    is_debit boolean
);


ALTER TABLE public.journal_entry OWNER TO postgres;

--
-- Name: remarks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.remarks (
    remark_id integer NOT NULL,
    gstin character varying(15) NOT NULL,
    remark text NOT NULL
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
    dated date DEFAULT CURRENT_DATE,
    gstin character varying(15) NOT NULL,
    purity character varying(10) DEFAULT '75ct'::character varying NOT NULL,
    weight numeric(10,3) DEFAULT 0 NOT NULL,
    bank boolean DEFAULT false,
    is_debit boolean
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
-- Data for Name: bill; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bill (id, bill_no, gstin, purity, wt, rate, cgst_rate, sgst_rate, igst_rate, dated, bank, cgst, sgst, igst, is_debit) FROM stdin;
13	BILL-013	GSTIN005	20	8.000	6000.00	0.00	0.00	0.00	2025-06-14	f	0	0	0	\N
14	BILL-014	GSTIN006	18	3.000	5950.00	0.00	0.00	0.00	2025-06-15	t	0	0	0	\N
15	BILL-015	GSTIN007	24	7.500	6300.00	0.00	0.00	0.00	2025-06-16	f	0	0	0	\N
16	BILL101	GSTIN002	22K	5.200	4700.00	0.00	0.00	0.00	2025-06-02	t	0	0	0	\N
17	BILL102	GSTIN006	20K	8.500	4950.00	0.00	0.00	0.00	2025-06-06	f	0	0	0	\N
18	BILL103	GSTIN010	22K	3.000	5000.00	0.00	0.00	0.00	2025-06-10	f	0	0	0	\N
19	BILL104	GSTIN005	21K	6.000	4600.00	0.00	0.00	0.00	2025-06-15	f	0	0	0	\N
20	BILL105	GSTIN008	18K	7.000	4800.00	0.00	0.00	0.00	2025-06-18	f	0	0	0	\N
21	BILL106	GSTIN002	20K	9.500	5100.00	0.00	0.00	0.00	2025-06-22	t	0	0	0	\N
22	BILL107	GSTIN006	22K	2.800	5200.00	0.00	0.00	0.00	2025-06-26	f	0	0	0	\N
23	BILL1001	GSTIN001	22CT	10.500	5400.00	0.00	0.00	0.00	2025-06-17	f	0	0	0	t
24	BILL1001	GSTIN001	22CT	12.300	5400.00	0.00	0.00	0.00	2025-06-17	f	0	0	0	t
25	BILL1002	GSTIN002	18CT	5.000	5100.00	0.00	0.00	0.00	2025-06-16	t	0	0	0	f
26	BILL1003	GSTIN010	22CT	7.500	5300.00	0.00	0.00	0.00	2025-06-07	f	0	0	0	t
27	BILL1001	GSTIN001	22CT	12.300	5400.00	0.00	0.00	0.00	2025-06-17	f	0	0	0	t
28	BILL1002	GSTIN002	18CT	5.000	5100.00	0.00	0.00	0.00	2025-06-16	t	0	0	0	f
29	BILL1003	GSTIN010	22CT	7.500	5300.00	0.00	0.00	0.00	2025-06-07	f	0	0	0	t
30	BILL-354913	GSTIN001	18 CT	10.000	7200.00	0.00	0.00	0.00	2025-06-18	f	0	0	0	t
32	BILL-009	GSTIN002	22K	5.000	4800.00	0.00	0.00	0.00	2025-06-19	f	0	0	0	f
11	BILL-011	GSTIN003	22	10.000	5000.00	0.00	0.00	0.00	2025-06-19	f	0	0	0	\N
\.


--
-- Data for Name: cash; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cash (id, dated, gstin, amount, bank, is_debit) FROM stdin;
11	2025-06-12	GSTIN003	45000.00	f	\N
12	2025-06-13	GSTIN004	30000.00	t	\N
13	2025-06-14	GSTIN005	25000.00	f	\N
14	2025-06-15	GSTIN006	52000.00	t	\N
15	2025-06-16	GSTIN007	61000.00	f	\N
16	2025-06-01	GSTIN001	10000.00	f	\N
17	2025-06-07	GSTIN007	25000.00	f	\N
18	2025-06-12	GSTIN002	15000.00	t	\N
19	2025-06-16	GSTIN006	3000.00	t	\N
20	2025-06-21	GSTIN001	2000.00	f	\N
21	2025-06-27	GSTIN007	4000.00	f	\N
22	2025-06-15	GSTIN003	250000.00	f	t
23	2025-06-14	GSTIN001	100000.00	t	f
26	2025-06-15	GSTIN003	250000.00	f	t
27	2025-06-14	GSTIN001	100000.00	t	f
29	2025-06-17	GSTIN001	100000.00	f	t
31	2025-06-19	GSTIN001	2500.00	f	t
\.


--
-- Data for Name: customer_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_details (gstin, name, address, phone, email) FROM stdin;
GSTIN001	Amit Jewels	\N	9876543210	amitjewels@example.com
GSTIN002	Sharma Traders	\N	9123456780	sharmatraders@example.com
GSTIN003	Lakshmi Metals	\N	9988776655	lakshmimetals@example.com
GSTIN004	Kohinoor Gold	\N	8877665544	kohinoorgold@example.com
GSTIN005	Ridhi Sidhi	\N	9001122334	ridhisidhi@example.com
GSTIN006	Sona Chandi	\N	9887766554	sonachandi@example.com
GSTIN007	Ganesh & Sons	\N	9663344552	ganeshandsons@example.com
GSTIN008	Raj Goldsmiths	\N	9111222333	rajgoldsmiths@example.com
GSTIN009	Mahalaxmi Stores	\N	9334455667	mahalaxmistores@example.com
GSTIN010	Zaveri Bazaar	\N	9556677880	zaveribazaar@example.com
\.


--
-- Data for Name: gold; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gold (id, dated, gstin, purity, weight, is_bank, is_debit) FROM stdin;
1	2025-06-11	GSTIN006	24CT	25.0	f	t
2	2025-06-10	GSTIN007	22CT	15.75	f	f
4	2025-06-11	GSTIN006	24CT	25.0	f	t
5	2025-06-10	GSTIN007	22CT	15.75	f	f
6	2025-06-16	GSTIN002	18CT	200.56	f	f
\.


--
-- Data for Name: journal; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.journal (id, gstin, entry_type, amount, remark_id, dated, bank, entry_id, is_debit) FROM stdin;
2025-06-16 16:13:19.315028	GSTIN001	cash	10000.00	61	2025-06-01	f	16	\N
2025-06-16 16:13:19.316641	GSTIN002	bill	24440.00	62	2025-06-02	t	16	\N
2025-06-16 16:13:19.31768	GSTIN003	gold	80.50	63	2025-06-03	f	31	\N
2025-06-16 16:13:19.318633	GSTIN004	stock	150.00	64	2025-06-04	t	32	\N
2025-06-16 16:13:19.320195	GSTIN006	bill	42075.00	66	2025-06-06	f	17	\N
2025-06-16 16:13:19.320863	GSTIN007	cash	25000.00	67	2025-06-07	f	17	\N
2025-06-16 16:13:19.322105	GSTIN008	stock	65.30	68	2025-06-08	f	33	\N
2025-06-16 16:13:19.322903	GSTIN009	gold	95.75	69	2025-06-09	t	34	\N
2025-06-16 16:13:19.323735	GSTIN010	bill	15000.00	70	2025-06-10	f	18	\N
2025-06-16 16:13:19.325191	GSTIN002	cash	15000.00	72	2025-06-12	t	18	\N
2025-06-16 16:13:19.326004	GSTIN003	stock	120.20	73	2025-06-13	f	35	\N
2025-06-16 16:13:19.32664	GSTIN004	gold	50.00	74	2025-06-14	t	36	\N
2025-06-16 16:13:19.32743	GSTIN005	bill	27600.00	75	2025-06-15	f	19	\N
2025-06-16 16:13:19.328604	GSTIN006	cash	3000.00	76	2025-06-16	t	19	\N
2025-06-16 16:13:19.330749	GSTIN008	bill	33600.00	78	2025-06-18	f	20	\N
2025-06-16 16:13:19.331467	GSTIN009	stock	88.80	79	2025-06-19	t	37	\N
2025-06-16 16:13:19.332724	GSTIN010	gold	120.00	80	2025-06-20	f	38	\N
2025-06-16 16:13:19.333894	GSTIN001	cash	2000.00	81	2025-06-21	f	20	\N
2025-06-16 16:13:19.33482	GSTIN002	bill	48450.00	82	2025-06-22	t	21	\N
2025-06-16 16:13:19.335727	GSTIN003	gold	45.50	83	2025-06-23	f	39	\N
2025-06-16 16:13:19.336866	GSTIN004	stock	60.00	84	2025-06-24	t	40	\N
2025-06-16 16:13:19.338628	GSTIN006	bill	14560.00	86	2025-06-26	f	22	\N
2025-06-16 16:13:19.339364	GSTIN007	cash	4000.00	87	2025-06-27	f	21	\N
2025-06-16 16:13:19.340343	GSTIN008	stock	135.00	88	2025-06-28	t	41	\N
2025-06-16 16:13:19.341203	GSTIN009	gold	70.00	89	2025-06-29	f	42	\N
2025-06-17 18:48:15.294217	GSTIN001	bill	56700.00	91	2025-06-17	f	23	t
2025-06-17 18:48:59.680994	GSTIN001	bill	66420.00	92	2025-06-17	f	24	t
2025-06-17 18:48:59.68861	GSTIN002	bill	25500.00	93	2025-06-16	t	25	f
2025-06-17 18:48:59.690715	GSTIN003	cash	250000.00	\N	2025-06-15	f	22	t
2025-06-17 18:48:59.696229	GSTIN001	cash	100000.00	\N	2025-06-14	t	23	f
2025-06-17 18:48:59.698169	GSTIN004	stock	30.00	94	2025-06-13	f	45	t
2025-06-17 18:48:59.704751	GSTIN005	stock	50.50	\N	2025-06-12	t	46	f
2025-06-17 18:48:59.70804	GSTIN006	gold	25.00	95	2025-06-11	f	1	t
2025-06-17 18:48:59.713148	GSTIN007	gold	15.75	\N	2025-06-10	f	2	f
2025-06-17 18:48:59.714256	GSTIN008	remarks	\N	96	2025-06-09	f	96	t
2025-06-17 18:48:59.715978	GSTIN009	remarks	\N	97	2025-06-08	f	97	f
2025-06-17 18:48:59.716841	GSTIN010	bill	39750.00	\N	2025-06-07	f	26	t
2025-06-17 18:49:23.288406	GSTIN001	bill	66420.00	102	2025-06-17	f	27	t
2025-06-17 18:49:23.293174	GSTIN002	bill	25500.00	103	2025-06-16	t	28	f
2025-06-17 18:49:23.296111	GSTIN003	cash	250000.00	\N	2025-06-15	f	26	t
2025-06-17 18:49:44.31675	GSTIN001	cash	100000.00	\N	2025-06-14	t	27	f
2025-06-17 18:49:44.33247	GSTIN004	stock	30.00	104	2025-06-13	f	49	t
2025-06-17 18:49:44.337183	GSTIN005	stock	50.50	\N	2025-06-12	t	50	f
2025-06-17 18:49:44.338437	GSTIN006	gold	25.00	105	2025-06-11	f	4	t
2025-06-17 18:50:04.376758	GSTIN007	gold	15.75	\N	2025-06-10	f	5	f
2025-06-17 18:50:04.382762	GSTIN008	remarks	\N	106	2025-06-09	f	106	t
2025-06-17 18:50:04.385143	GSTIN009	remarks	\N	107	2025-06-08	f	107	f
2025-06-17 18:50:04.387037	GSTIN010	bill	39750.00	\N	2025-06-07	f	29	t
2025-06-17 20:54:43.34681	GSTIN001	stock	11.00	\N	2025-06-17	f	52	t
2025-06-18 07:22:54.950549	GSTIN001	bill	72000.00	\N	2025-06-18	f	30	t
2025-06-18 13:56:51.620737	GSTIN001	cash	100000.00	\N	2025-06-17	f	29	t
2025-06-18 13:58:43.80967	GSTIN002	gold	200.56	\N	2025-06-16	f	6	f
2025-06-19 13:52:59.773617	GSTIN001	cash	2500.00	\N	2025-06-19	f	31	t
2025-06-19 13:52:59.774372	GSTIN002	bill	24000.00	\N	2025-06-19	f	32	f
2025-06-19 14:31:48.662509	GSTIN001	bill	50000.00	109	2025-06-19	f	11	t
2025-06-19 14:40:18.807132	GSTIN001	bill	50000.00	110	2025-06-19	f	11	t
2025-06-19 14:51:30.070099	GSTIN004	bill	37200.00	\N	2025-06-13	f	12	\N
\.


--
-- Data for Name: journal_entry; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.journal_entry (id, gstin, entry_type, amount, remark_id, dated, linked_row_id, is_bank, is_debit) FROM stdin;
\.


--
-- Data for Name: remarks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.remarks (remark_id, gstin, remark) FROM stdin;
61	GSTIN001	Opening balance
62	GSTIN002	June billing
63	GSTIN003	Gold purchased
64	GSTIN004	Stock refill
65	GSTIN005	Special instruction
66	GSTIN006	Bulk order
67	GSTIN007	Payment received
68	GSTIN008	Restocked
69	GSTIN009	Gold deposit
70	GSTIN010	Retail invoice
71	GSTIN001	Follow-up call
72	GSTIN002	Advance payment
73	GSTIN003	New consignment
74	GSTIN004	Gold return
75	GSTIN005	Retail order
76	GSTIN006	Cashback credited
77	GSTIN007	Urgent shipment
78	GSTIN008	Mid-month billing
79	GSTIN009	Opening stock
80	GSTIN010	Gold from refinery
81	GSTIN001	Customer refund
82	GSTIN002	Corporate billing
83	GSTIN003	Old gold exchange
84	GSTIN004	Returned goods
85	GSTIN005	Duplicate bill warning
86	GSTIN006	New scheme billing
87	GSTIN007	Cheque deposited
88	GSTIN008	Excess inventory
89	GSTIN009	Customer deposit
90	GSTIN010	Final remark test
91	GSTIN001	Invoice for customer A
92	GSTIN001	Customer A invoice
93	GSTIN002	Returned goods
94	GSTIN004	New stock added
95	GSTIN006	Melted gold
96	GSTIN008	Year-end adjustment
97	GSTIN009	Correcting stock mismatch
102	GSTIN001	Customer A invoice
103	GSTIN002	Returned goods
104	GSTIN004	New stock added
105	GSTIN006	Melted gold
106	GSTIN008	Year-end adjustment
107	GSTIN009	Correcting stock mismatch
109	GSTIN001	Corrected weight and rate
110	GSTIN001	Corrected weight and rate
\.


--
-- Data for Name: stock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock (id, dated, gstin, purity, weight, bank, is_debit) FROM stdin;
21	2025-06-12	GSTIN003	22	50.000	f	\N
22	2025-06-13	GSTIN004	20	35.000	t	\N
23	2025-06-14	GSTIN005	18	40.000	f	\N
24	2025-06-15	GSTIN006	24	25.000	t	\N
25	2025-06-16	GSTIN007	22	60.000	f	\N
26	2025-06-12	GSTIN003	22	20.000	f	\N
27	2025-06-13	GSTIN004	20	18.000	t	\N
28	2025-06-14	GSTIN005	24	22.000	f	\N
29	2025-06-15	GSTIN006	18	30.000	t	\N
30	2025-06-16	GSTIN007	22	28.000	f	\N
31	2025-06-03	GSTIN003	24K	80.500	f	\N
32	2025-06-04	GSTIN004	18K	150.000	t	\N
33	2025-06-08	GSTIN008	22K	65.300	f	\N
34	2025-06-09	GSTIN009	24K	95.750	t	\N
35	2025-06-13	GSTIN003	19K	120.200	f	\N
36	2025-06-14	GSTIN004	24K	50.000	t	\N
37	2025-06-19	GSTIN009	22K	88.800	t	\N
38	2025-06-20	GSTIN010	24K	120.000	f	\N
39	2025-06-23	GSTIN003	22K	45.500	f	\N
40	2025-06-24	GSTIN004	19K	60.000	t	\N
41	2025-06-28	GSTIN008	21K	135.000	t	\N
42	2025-06-29	GSTIN009	24K	70.000	f	\N
45	2025-06-13	GSTIN004	24CT	30.000	f	t
46	2025-06-12	GSTIN005	22CT	50.500	t	f
49	2025-06-13	GSTIN004	24CT	30.000	f	t
50	2025-06-12	GSTIN005	22CT	50.500	t	f
52	2025-06-17	GSTIN001	18CT	11.000	f	t
\.


--
-- Name: bill_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bill_id_seq', 32, true);


--
-- Name: cash_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cash_id_seq', 31, true);


--
-- Name: gold_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gold_id_seq', 6, true);


--
-- Name: remarks_remark_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.remarks_remark_id_seq', 111, true);


--
-- Name: stock_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_id_seq', 52, true);


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
    ADD CONSTRAINT journal_entry_pkey PRIMARY KEY (id);


--
-- Name: journal journal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal
    ADD CONSTRAINT journal_pkey PRIMARY KEY (id);


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

