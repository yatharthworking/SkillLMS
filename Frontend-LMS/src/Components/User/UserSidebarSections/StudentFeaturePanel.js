import React from "react";
import "./StudentFeaturePanel.css";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

export default function StudentFeaturePanel({
  eyebrow = "LMS Feature",
  title,
  description,
  highlights = [],
  primaryLabel,
  onPrimaryAction,
  secondaryLabel,
  onSecondaryAction,
}) {
  return (
    <div className="studentFeaturePanel">
      <div className="studentFeatureHero">
        <span className="studentFeatureEyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <div className="studentFeatureHighlights">
        {highlights.map((item, index) => (
          <div key={index} className="studentFeatureCard">
            <div className="studentFeatureCardIcon">
              <AutoAwesomeRoundedIcon fontSize="small" />
            </div>
            <div className="studentFeatureCardText">{item}</div>
          </div>
        ))}
      </div>

      <div className="studentFeatureActions">
        {primaryLabel && (
          <button type="button" className="studentFeaturePrimary" onClick={onPrimaryAction}>
            <span>{primaryLabel}</span>
            <ArrowForwardRoundedIcon fontSize="small" />
          </button>
        )}
        {secondaryLabel && (
          <button type="button" className="studentFeatureSecondary" onClick={onSecondaryAction}>
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
