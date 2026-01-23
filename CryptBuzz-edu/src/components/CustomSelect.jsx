import React, { useMemo } from "react";
import { Select, ConfigProvider } from "antd";
import { useSettings } from "@/providers/SettingsProvider";

const CustomSelect = ({
  mode,
  options = [],
  value,
  onChange,
  onBlur,
  placeholder = "Select",
  size = "middle",
  style = {},
  disabled = false,
  loading = false,
  allowClear = true,
  showSearch = true,
  filterOption = true,
  maxTagCount = "responsive",
  popupMatchSelectWidth = false,
  popupClassName = "",
  ...props
}) => {
  const { settings } = useSettings();
  const isDark = settings.themeMode === "dark";

  const theme = useMemo(() => {
    if (isDark) {
      return {
        token: {
          colorPrimary: "#facc15", // focus color (yellow)
          colorBgBase: "#1f212a",
          colorText: "#e5e7eb",
          colorTextPlaceholder: "#9ca3af",
          colorBorder: "#2a2d3a",
          borderRadius: 8,
          controlHeight: 40,
        },
        components: {
          Select: {
            selectorBg: "#1f212a",        // select input bg
            optionBg: "#1f212a",          // dropdown bg
            optionActiveBg: "#2a2d3a",
            optionSelectedBg: "#2f3342",
            optionSelectedColor: "#facc15",
            multipleItemBg: "#2f3342",
            multipleItemColor: "#facc15",
            multipleItemBorderColor: "#3b3f52",
            clearBg: "#1f212a",
            activeBorderColor: "#facc15", // border color when focused/open
            hoverBorderColor: "#facc15",  // border color on hover
          },
        },
      };
    } else {
      return {
        token: {
          colorPrimary: "#facc15", // focus color (yellow)
          colorBgBase: "#ffffff",
          colorText: "#1f2937",
          colorTextPlaceholder: "#6b7280",
          colorBorder: "#d1d5db",
          borderRadius: 8,
          controlHeight: 40,
        },
        components: {
          Select: {
            selectorBg: "#ffffff",
            optionBg: "#ffffff",
            optionActiveBg: "#f3f4f6",
            optionSelectedBg: "#fef3c7",
            optionSelectedColor: "#facc15",
            multipleItemBg: "#fef3c7",
            multipleItemColor: "#92400e",
            multipleItemBorderColor: "#fbbf24",
            clearBg: "#ffffff",
            activeBorderColor: "#facc15", // border color when focused/open
            hoverBorderColor: "#facc15",  // border color on hover
          },
        },
      };
    }
  }, [isDark]);

  const normalizedValue =
    mode === "multiple"
      ? Array.isArray(value)
        ? value.map(String)
        : []
      : value
        ? String(value)
        : undefined;

  const handleChange = (val) => {
    if (mode === "multiple") {
      onChange?.(val.map(String));
    } else {
      onChange?.(String(val));
    }
  };

  return (
    <>
      <style>
        {`
          .custom-select-wrapper .ant-select-selection-item-remove {
            color: ${isDark ? "#facc15" : "#92400e"} !important;
            opacity: 0.8;
            transition: opacity 0.2s;
          }
          .custom-select-wrapper .ant-select-selection-item-remove:hover {
            opacity: 1;
            color: ${isDark ? "#fbbf24" : "#78350f"} !important;
          }
          .custom-select-wrapper .ant-select-selection-item-remove svg {
            color: ${isDark ? "#facc15" : "#92400e"} !important;
          }
          /* Make search and clear icons visible in dark mode */
          .custom-select-wrapper .ant-select-selection-search-icon,
          .custom-select-wrapper .ant-select-selection-search-icon svg,
          .custom-select-wrapper .ant-select-selection-search-icon span,
          .custom-select-wrapper .ant-select-selection-search-icon span svg,
          .custom-select-wrapper .ant-select-clear,
          .custom-select-wrapper .ant-select-clear svg,
          .custom-select-wrapper .ant-select-clear span,
          .custom-select-wrapper .ant-select-clear span svg,
          .custom-select-wrapper .ant-select-arrow,
          .custom-select-wrapper .ant-select-arrow svg,
          .custom-select-wrapper .ant-select-arrow span,
          .custom-select-wrapper .ant-select-arrow span svg,
          .custom-select-wrapper .ant-select .ant-select-selection-item,
          .custom-select-wrapper .ant-select .ant-select-selector .anticon,
          .custom-select-wrapper .ant-select .ant-select-selector .anticon svg {
            color: ${isDark ? "#e5e7eb" : "#1f2937"} !important;
            opacity: ${isDark ? "0.8" : "1"} !important;
            fill: ${isDark ? "#e5e7eb" : "#1f2937"} !important;
          }
          .custom-select-wrapper .ant-select-selection-search-icon:hover,
          .custom-select-wrapper .ant-select-selection-search-icon:hover svg,
          .custom-select-wrapper .ant-select-clear:hover,
          .custom-select-wrapper .ant-select-clear:hover svg,
          .custom-select-wrapper .ant-select-arrow:hover,
          .custom-select-wrapper .ant-select-arrow:hover svg {
            opacity: 1 !important;
            color: ${isDark ? "#facc15" : "#92400e"} !important;
            fill: ${isDark ? "#facc15" : "#92400e"} !important;
          }
          /* Keep border but remove outline on focus */
          .custom-select-wrapper .ant-select,
          .custom-select-wrapper .ant-select .ant-select-selector,
          .custom-select-wrapper .ant-select-outlined,
          .custom-select-wrapper .ant-select-outlined .ant-select-selector {
            outline: none !important;
            outline-width: 0 !important;
            outline-style: none !important;
            outline-offset: 0 !important;
          }
          .custom-select-wrapper .ant-select-focused:not(.ant-select-disabled),
          .custom-select-wrapper .ant-select-open:not(.ant-select-disabled),
          .custom-select-wrapper .ant-select-focused:not(.ant-select-disabled) .ant-select-selector,
          .custom-select-wrapper .ant-select-open:not(.ant-select-disabled) .ant-select-selector,
          .custom-select-wrapper .ant-select-focused:not(.ant-select-disabled) .ant-select-selector *,
          .custom-select-wrapper .ant-select-open:not(.ant-select-disabled) .ant-select-selector *,
          .custom-select-wrapper .ant-select-outlined.ant-select-focused:not(.ant-select-disabled),
          .custom-select-wrapper .ant-select-outlined.ant-select-open:not(.ant-select-disabled),
          .custom-select-wrapper .ant-select-outlined.ant-select-focused:not(.ant-select-disabled) .ant-select-selector,
          .custom-select-wrapper .ant-select-outlined.ant-select-open:not(.ant-select-disabled) .ant-select-selector {
            outline: none !important;
            outline-width: 0 !important;
            outline-style: none !important;
            outline-offset: 0 !important;
            box-shadow: none !important;
          }
          .custom-select-wrapper .ant-select:not(.ant-select-disabled):hover,
          .custom-select-wrapper .ant-select:not(.ant-select-disabled):hover .ant-select-selector,
          .custom-select-wrapper .ant-select-outlined:not(.ant-select-disabled):hover,
          .custom-select-wrapper .ant-select-outlined:not(.ant-select-disabled):hover .ant-select-selector {
            outline: none !important;
            outline-width: 0 !important;
            outline-style: none !important;
            outline-offset: 0 !important;
            box-shadow: none !important;
          }
          /* Remove any white/light outlines or box-shadows from pseudo-elements */
          .custom-select-wrapper .ant-select-focused .ant-select-selector::after,
          .custom-select-wrapper .ant-select-open .ant-select-selector::after,
          .custom-select-wrapper .ant-select-focused .ant-select-selector::before,
          .custom-select-wrapper .ant-select-open .ant-select-selector::before,
          .custom-select-wrapper .ant-select-outlined.ant-select-focused .ant-select-selector::after,
          .custom-select-wrapper .ant-select-outlined.ant-select-open .ant-select-selector::after {
            display: none !important;
            outline: none !important;
          }
          /* Remove outline but keep border */
          .custom-select-wrapper .ant-select-focused .ant-select-selector,
          .custom-select-wrapper .ant-select-open .ant-select-selector,
          .custom-select-wrapper .ant-select-outlined.ant-select-focused .ant-select-selector,
          .custom-select-wrapper .ant-select-outlined.ant-select-open .ant-select-selector {
            outline: none !important;
            outline-width: 0 !important;
            outline-style: none !important;
            outline-offset: 0 !important;
            box-shadow: none !important;
          }
          .ant-select .ant-select-suffix {
            color: ${isDark ? "#e5e7eb" : "#1f2937"} !important;
            fill: ${isDark ? "#e5e7eb" : "#1f2937"} !important;
            opacity: ${isDark ? "0.8" : "1"} !important;
            transition: opacity 0.2s;
          }
          .ant-select .ant-select-suffix:hover {
            opacity: 1 !important;
            color: ${isDark ? "#facc15" : "#92400e"} !important;
            fill: ${isDark ? "#facc15" : "#92400e"} !important;
          }
          .ant-select.ant-select-outlined {
            background-color: ${isDark ? "#1f212a" : "#ffffff"} !important;
          }
        `}
      </style>
      <div className="custom-select-wrapper">
        <ConfigProvider theme={theme}>
          <Select
            mode={mode}
            value={normalizedValue}
            options={options}
            onChange={handleChange}
            onBlur={onBlur}
            placeholder={placeholder}
            size={size}
            style={{ width: "100%", ...style }}
            disabled={disabled}
            loading={loading}
            allowClear={allowClear}
            showSearch={showSearch}
            filterOption={filterOption}
            maxTagCount={maxTagCount}
            popupMatchSelectWidth={popupMatchSelectWidth}
            popupClassName={`${isDark ? 'dark' : 'light'}-select-dropdown ${popupClassName}`}
            getPopupContainer={(trigger) => trigger.parentNode}
            dropdownStyle={{
              backgroundColor: isDark ? "#1f212a" : "#ffffff",
              border: isDark ? "1px solid #2a2d3a" : "1px solid #d1d5db",
            }}
            {...props}
          />
        </ConfigProvider>
      </div>
    </>
  );
};

export default CustomSelect;