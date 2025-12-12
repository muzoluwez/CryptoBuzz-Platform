import React from 'react';

/**
 * DateTimePicker Component
 * 
 * Simple date and time picker for scheduling.
 */
const DateTimePicker = ({ value, onChange, label, min, max, ...props }) => {
    return (
        <div className="flex flex-col gap-2">
            {label && <label className="form-label">{label}</label>}
            <input
                type="datetime-local"
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                min={min}
                max={max}
                className="form-control"
                {...props}
            />
        </div>
    );
};

export default DateTimePicker;



