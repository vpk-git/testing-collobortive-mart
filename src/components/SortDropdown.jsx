import React from 'react';
import styles from './SortDropdown.module.css';

const SortDropdown = ({ value, options = [], onChange }) => {
  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor="sort-dropdown">Sort By:</label>
      <select 
        id="sort-dropdown"
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortDropdown;
