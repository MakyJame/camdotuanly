import React, { useState, useEffect } from 'react';

function Plus() {
  const [assetType, setAssetType] = useState('Xe Máy'); // Thêm lựa chọn tài sản
  const [loan, setLoan] = useState('0');
  const [numericLoan, setNumericLoan] = useState(0);
  const [loanDate, setLoanDate] = useState('');
  const [totalDays, setTotalDays] = useState(0);
  const [totalMonths, setTotalMonths] = useState(0);
  const [leftoverDays, setLeftoverDays] = useState(0);
  const [interestResults, setInterestResults] = useState([]);
  const [dateError, setDateError] = useState('');

  // Hàm định dạng số với dấu phẩy
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Hàm xử lý thay đổi số tiền vay
  const handleLoanChange = (e) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, '');
    const parsedValue = numericValue === '' ? 0 : parseInt(numericValue, 10);
    setNumericLoan(parsedValue);
    setLoan(formatNumber(parsedValue));
  };

  // Hàm xử lý thay đổi tài sản cầm cố
  const handleAssetTypeChange = (e) => {
    setAssetType(e.target.value);
  };

  // Hàm xử lý thay đổi ngày vay (dd/mm/yyyy)
  const handleDateChange = (e) => {
    const value = e.target.value;
    setLoanDate(value);
  };

  // Hàm chuyển đổi từ dd/mm/yyyy sang Date object
  const parseDate = (dateStr) => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Tháng trong Date object bắt đầu từ 0
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  };

  // Hàm xác định lãi suất hàng tháng dựa trên loại tài sản và số tiền vay
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

  // Hàm xác định hệ số lãi từ ngày lẻ dựa trên số ngày lẻ
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

  // Hàm tính tổng số ngày, tháng và số ngày lẻ
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

    const endDate = new Date(); // Ngày hiện tại
    const timeDiff = endDate - startDate;
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) { // Ngày vay không được sau ngày hiện tại
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

  // Hàm tính lãi dựa trên loại tài sản và số tiền vay
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

    setInterestResults([{
      assetType,
      baseMonthlyRate,
      interestMonths,
      leftoverDaysRate,
      interestDays,
      totalInterest
    }]);
  };

  // Sử dụng useEffect để tính toán khi thay đổi ngày vay
  useEffect(() => {
    calculateTime();
  }, [loanDate]);

  // Sử dụng useEffect để tính toán khi thay đổi số tiền vay, tháng, hoặc ngày lẻ
  useEffect(() => {
    calculateInterest();
  }, [numericLoan, totalMonths, leftoverDays, assetType]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Tính Tiền Lãi Cầm Đồ</h2>

      {/* Chọn loại tài sản cầm cố */}
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

      {/* Nhập số tiền cầm đồ */}
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

      {/* Nhập ngày vay */}
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

      {/* Hiển thị thông báo lỗi về ngày */}
      {dateError && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          {dateError}
        </div>
      )}

      {/* Hiển thị tổng số ngày, tháng và ngày lẻ */}
      {loanDate && loanDate.length === 10 && totalDays > 0 && !dateError && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Thông Tin Cầm Đồ</h3>
          <p>Tổng số ngày cầm cố: {totalDays} ngày</p>
          <p>Tổng số tháng cầm cố: {totalMonths} tháng</p>
          <p>Số ngày lẻ cầm cố: {leftoverDays} ngày</p>
        </div>
      )}

      {/* Hiển thị bảng lãi suất */}
      {interestResults.length > 0 && (
        <div>
          <h3>Số Tiền Lãi</h3>
          <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Loại Tài Sản</th>
                <th>Lãi Suất Hàng Tháng (%)</th>
                <th>Lãi Từ Tháng</th>
                <th>Lãi Từ Ngày Lẻ (%)</th>
                <th>Lãi Từ Ngày Lẻ</th>
                <th>Tổng Lãi</th>
              </tr>
            </thead>
            <tbody>
              {interestResults.map((item, index) => (
                <tr key={index}>
                  <td>{item.assetType}</td>
                  <td>{item.baseMonthlyRate}%</td>
                  <td>{formatNumber(item.interestMonths.toFixed(0))} VND</td>
                  <td>{item.leftoverDaysRate.toFixed(2)}%</td>
                  <td>{formatNumber(item.interestDays.toFixed(0))} VND</td>
                  <td>{formatNumber(item.totalInterest.toFixed(0))} VND</td>
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
