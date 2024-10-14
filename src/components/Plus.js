import React, { useState, useEffect } from 'react';
import './Plus.css';

function Plus() {
  const [assetType, setAssetType] = useState('Xe Máy');
  const [loan, setLoan] = useState('0');
  const [numericLoan, setNumericLoan] = useState(0);
  const [loanDate, setLoanDate] = useState('');
  const [totalDays, setTotalDays] = useState(0);
  const [totalMonths, setTotalMonths] = useState(0);
  const [leftoverDays, setLeftoverDays] = useState(0);
  const [interestResults, setInterestResults] = useState([]);
  const [dateError, setDateError] = useState('');

  const formatNumber = (num) => {
    if (num === 0) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleLoanChange = (e) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, '');
    const parsedValue = numericValue === '' ? 0 : parseInt(numericValue, 10);
    setNumericLoan(parsedValue);
    setLoan(formatNumber(parsedValue));
  };

  const handleAssetTypeChange = (e) => {
    setAssetType(e.target.value);
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    setLoanDate(value);
  };

  const parseDate = (dateStr) => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  };

  const getBaseMonthlyRate = (assetType, loanAmount) => {
    if (assetType === 'Xe Máy') {
      if (loanAmount < 3000000) return 9;
      else if (loanAmount < 7000000) return 6;
      else if (loanAmount < 15000000) return 5;
      else return 4.5;
    } else if (assetType === 'Giấy Tờ Xe') {
      return 6;
    }
    return 0;
  };

  const getLeftoverDaysMultiplier = (leftoverDays) => {
    if (leftoverDays >= 1 && leftoverDays <= 2) return 1;
    else if (leftoverDays >= 3 && leftoverDays <= 5) return 1.5;
    else if (leftoverDays >= 6 && leftoverDays <= 8) return 2;
    else if (leftoverDays >= 9 && leftoverDays <= 11) return 2.5;
    else if (leftoverDays >= 12 && leftoverDays <= 15) return 3;
    else if (leftoverDays >= 16 && leftoverDays <= 19) return 3.5;
    else if (leftoverDays >= 20 && leftoverDays <= 24) return 4;
    else if (leftoverDays >= 25 && leftoverDays <= 29) return 4.5;
    else return 0;
  };

  const calculateTime = () => {
    if (!loanDate) {
      setTotalDays(0);
      setTotalMonths(0);
      setLeftoverDays(0);
      setDateError('');
      return;
    }

    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!regex.test(loanDate)) {
      setTotalDays(0);
      setTotalMonths(0);
      setLeftoverDays(0);
      setDateError('Định dạng ngày không hợp lệ. Vui lòng nhập lại (dd/mm/yyyy).');
      return;
    }

    const startDate = parseDate(loanDate);
    if (!startDate || isNaN(startDate)) {
      setTotalDays(0);
      setTotalMonths(0);
      setLeftoverDays(0);
      setDateError('Ngày không hợp lệ. Vui lòng nhập lại.');
      return;
    }

    const endDate = new Date();
    const timeDiff = endDate - startDate;
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

    if (daysDiff < 0) {
      setTotalDays(0);
      setTotalMonths(0);
      setLeftoverDays(0);
      setDateError('Ngày vay không được sau ngày hiện tại.');
      return;
    }

    const months = Math.floor(daysDiff / 30);
    const days = daysDiff % 30;

    setTotalDays(daysDiff);
    setTotalMonths(months);
    setLeftoverDays(days);
    setDateError('');
  };

  const calculateInterest = () => {
    if (numericLoan === 0 || totalDays === 0) {
      setInterestResults([]);
      return;
    }

    const baseMonthlyRate = getBaseMonthlyRate(assetType, numericLoan);
    const multiplier = getLeftoverDaysMultiplier(leftoverDays);
    const leftoverDaysRate = (baseMonthlyRate / 5) * multiplier;

    const interestMonths = numericLoan * (baseMonthlyRate / 100) * totalMonths;
    const interestDays = numericLoan * (leftoverDaysRate / 100);
    const totalInterest = interestMonths + interestDays;

    // Tính số tiền cần thanh toán
    const totalPayment = numericLoan + totalInterest;

    setInterestResults([{
      assetType,
      baseMonthlyRate,
      interestMonths: Math.round(interestMonths), // Làm tròn
      leftoverDaysRate: Math.round(leftoverDaysRate), // Làm tròn
      interestDays: Math.round(interestDays), // Làm tròn
      totalInterest: Math.round(totalInterest), // Làm tròn
      totalPayment: Math.round(totalPayment) // Làm tròn
    }]);
  };

  useEffect(() => {
    calculateTime();
  }, [loanDate]);

  useEffect(() => {
    calculateInterest();
  }, [numericLoan, totalMonths, leftoverDays, assetType]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Tính Tiền Lãi Cầm Đồ</h2>

      <div style={{ marginBottom: '20px' }}>
        <label>
          Loại tài sản cầm cố:
          <select
            value={assetType}
            onChange={handleAssetTypeChange}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            <option value="Xe Máy">Xe Máy</option>
            <option value="Giấy Tờ Xe">Giấy Tờ Xe</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>
          Số tiền cầm đồ:
          <input
            type='text'
            name='loan'
            value={loan}
            onChange={handleLoanChange}
            placeholder='Nhập số tiền cầm cố'
            style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>
          Ngày vay (dd/mm/yyyy):
          <input
            type='text'
            name='loanDate'
            value={loanDate}
            onChange={handleDateChange}
            placeholder='dd/mm/yyyy'
            maxLength='10'
            style={{ marginLeft: '10px', padding: '5px', width: '150px' }}
          />
        </label>
      </div>

      {dateError && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          {dateError}
        </div>
      )}

      {loanDate && loanDate.length === 10 && totalDays > 0 && !dateError && (
        <div className="info" style={{ marginBottom: '20px' }}>
          <h3>Thông Tin Cầm Đồ</h3>
          <p>Tổng số ngày cầm cố: {totalDays} ngày</p>
          <p>Tổng số tháng cầm cố: {totalMonths} tháng</p>
          <p>Số ngày lẻ cầm cố: {leftoverDays} ngày</p>
        </div>
      )}

      {interestResults.length > 0 && (
        <div className="table-container">
          <h3>Số Tiền Lãi</h3>
          <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>Loại Tài Sản</th>
                <th>Lãi Suất Cơ Bản (%)</th>
                <th>Lãi Tháng</th>
                <th>Lãi Ngày</th>
                <th>Tổng Lãi</th>
                <th>Số Tiền Cần Thanh Toán</th>
              </tr>
            </thead>
            <tbody>
              {interestResults.map((result, index) => (
                <tr key={index}>
                  <td>{result.assetType}</td>
                  <td>{result.baseMonthlyRate}</td>
                  <td>{formatNumber(result.interestMonths)}</td>
                  <td>{formatNumber(result.interestDays)}</td>
                  <td>{formatNumber(result.totalInterest)}</td>
                  <td>{formatNumber(result.totalPayment)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Plus;
