import React from "react";
import cx from "classnames";
import "./styles.css";

export default function ComponentTabs(props) {
  const { options, option, onChange, type = "block", icons } = props;

  const onClick = (opt) => {
    if (onChange) {
      onChange(opt);
    }
  };

  return (
    <div className={cx("Tab", type)}>
      {options.map((opt) => {
        const label = opt;
        return (
          <div className={cx("Tab-option", "muted", { active: opt === option })} onClick={() => onClick(opt)} key={opt}>
            {icons && icons[opt] && <img className="Tab-option-icon" src={icons[opt]} alt={option} />}
            {label}
          </div>
        );
      })}
    </div>
  );
}
