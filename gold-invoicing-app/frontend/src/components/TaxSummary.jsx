import React, { useState, useEffect } from 'react';

const calculateHallmarkingTaxes = (hallmarkingCharges, cgstRate, sgstRate, igstRate) => {
    const taxable = parseFloat(hallmarkingCharges) || 0;
    const cgst = (taxable * (cgstRate || 0)) / 100;
    const sgst = (taxable * (sgstRate || 0)) / 100;
    const igst = (taxable * (igstRate || 0)) / 100;
    return {
        taxable,
        cgst,
        sgst,
        igst,
    };
};

const TaxSummary = ({
    calculations,
    cgstRate,
    sgstRate,
    igstRate,
    hallmarkingCharges,
    hallmarkingPieces,
    hallmarkingCgst,
    hallmarkingSgst,
    discount,
    onCgstChange,
    onSgstChange,
    onIgstChange,
    onHallmarkingChange,
    onPiecesChange,
    onHallmarkingCgstChange,
    onHallmarkingSgstChange,
    onDiscountChange,
}) => {

    const hallmarkingTax = calculateHallmarkingTaxes(hallmarkingCharges, cgstRate, sgstRate, igstRate);
    return (
        <div style={{ width: '400px', marginLeft: 'auto', marginTop: '30px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    <tr>
                        <td style={{
                            padding: '8px',
                            fontWeight: 'bold',
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #333',
                        }}>
                            Total Taxable
                        </td>
                        <td style={{
                            padding: '8px',
                            textAlign: 'right',
                            fontWeight: 'bold',
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #333',
                        }}>
                            ₹{parseFloat(calculations.totalTaxable).toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </td>
                    </tr>

                    <tr>
                        <td style={{ padding: '8px', border: '1px solid #333' }}>
                            CGST&nbsp;
                            <input
                                type="number"
                                value={cgstRate}
                                min="0"
                                step="0.1"
                                onChange={e => onCgstChange(parseFloat(e.target.value) || 0)}
                                style={{ width: 60, marginRight: 4 }}
                            />%
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #333' }}>
                            ₹{parseFloat(calculations.cgstAmount).toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </td>
                    </tr>

                    <tr>
                        <td style={{ padding: '8px', border: '1px solid #333' }}>
                            SGST&nbsp;
                            <input
                                type="number"
                                value={sgstRate}
                                min="0"
                                step="0.1"
                                onChange={e => onSgstChange(parseFloat(e.target.value) || 0)}
                                style={{ width: 60, marginRight: 4 }}
                            />%
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #333' }}>
                            ₹{parseFloat(calculations.sgstAmount).toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </td>
                    </tr>

                    <tr>
                        <td style={{ padding: '8px', border: '1px solid #333' }}>
                            IGST&nbsp;
                            <input
                                type="number"
                                value={igstRate}
                                min="0"
                                step="0.1"
                                onChange={e => onIgstChange(parseFloat(e.target.value) || 0)}
                                style={{ width: 60, marginRight: 4 }}
                            />%
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #333' }}>
                            ₹{parseFloat(calculations.igstAmount).toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </td>
                    </tr>
                    <tr>
                        <td style={{ padding: '8px', border: '1px solid #333' }}>
                            Hallmarking Charges 9983 @ ₹
                            <input
                                type="number"
                                value={hallmarkingCharges}
                                min="0"
                                step="0.01"
                                onChange={e => onHallmarkingChange(parseFloat(e.target.value) || 0)}
                                style={{ width: 80, marginRight: 4 }}
                            />
                            <br />
                            <small>
                                <input
                                    type="number"
                                    value={hallmarkingPieces}
                                    min="0"
                                    step="1"
                                    onChange={e => onPiecesChange(parseInt(e.target.value) || 0)}
                                    style={{ width: 60, marginRight: 4 }}
                                /> Pieces
                            </small>
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #333' }}>
                            ₹{parseFloat(calculations.hallmarkingTotal).toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </td>
                    </tr>

                    <tr>
                        <td style={{ padding: '8px', border: '1px solid #333', paddingLeft: '20px' }}>
                            CGST&nbsp;
                            <input
                                type="number"
                                value={hallmarkingCgst}
                                min="0"
                                step="0.1"
                                onChange={e => onHallmarkingCgstChange(parseFloat(e.target.value) || 0)}
                                style={{ width: 60, marginRight: 4 }}
                            />%
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #333' }}>
                            ₹{parseFloat(calculations.hallmarkingCgstAmt).toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </td>
                    </tr>

                    <tr>
                        <td style={{ padding: '8px', border: '1px solid #333', paddingLeft: '20px' }}>
                            SGST&nbsp;
                            <input
                                type="number"
                                value={hallmarkingSgst}
                                min="0"
                                step="0.1"
                                onChange={e => onHallmarkingSgstChange(parseFloat(e.target.value) || 0)}
                                style={{ width: 60, marginRight: 4 }}
                            />%
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #333' }}>
                            ₹{parseFloat(calculations.hallmarkingSgstAmt).toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </td>
                    </tr>

                    <tr>
                        <td style={{ padding: '8px', border: '1px solid #333', paddingLeft: '20px' }}>
                            IGST 0.0%
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #333' }}>
                            ₹0.00
                        </td>
                    </tr>
                    <tr>
                        <td style={{ padding: '8px', border: '1px solid #333' }}>
                            Discount&nbsp;
                            <input
                                type="number"
                                value={discount}
                                min="0"
                                step="0.01"
                                onChange={e => onDiscountChange(parseFloat(e.target.value) || 0)}
                                style={{ width: 80, marginRight: 4 }}
                            />
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #333' }}>
                            -₹{parseFloat(discount).toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </td>
                    </tr>

                    <tr>
                        <td style={{ padding: '8px', border: '1px solid #333' }}>Round off</td>
                        <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #333' }}>
                            {parseFloat(calculations.roundOff) >= 0 ? '+' : ''}
                            ₹{calculations.roundOff}
                        </td>
                    </tr>

                    <tr>
                        <td style={{
                            padding: '12px',
                            fontWeight: 'bold',
                            fontSize: '18px',
                            backgroundColor: '#f0f0f0',
                            border: '2px solid #333',
                        }}>
                            Grand Total
                        </td>
                        <td style={{
                            padding: '12px',
                            textAlign: 'right',
                            fontWeight: 'bold',
                            fontSize: '18px',
                            backgroundColor: '#f0f0f0',
                            border: '2px solid #333',
                        }}>
                            ₹{parseFloat(calculations.grandTotal).toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </td>
                    </tr>
                </tbody>
            </table>

        </ div >
    );
};

export default TaxSummary;