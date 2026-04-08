import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";

function PrivacyPolicyDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="modal-title">Privacy Policy</DialogTitle>
      <DialogContent>
        <DialogContentText id="privacy-policy-description">
          Your privacy is important to us. This Privacy Policy explains how we
          collect, use, and share your personal information when you use our
          services. We are committed to protecting your data and ensuring that
          your personal information is handled responsibly.{" "}
          <li>
            {" "}
            <strong>Information Collection</strong>: We collect personal
            information that you provide directly to us, such as your name,
            email address, and payment information. We may also collect
            information automatically through your use of our services, such as
            your IP address and browsing behavior.
          </li>
          <li>
            {" "}
            <strong>Use of Information</strong>: We use the collected
            information to provide and improve our services, communicate with
            you, and personalize your experience. We may also use your
            information for marketing purposes with your consent.{" "}
          </li>
          <li>
            {" "}
            <strong>Sharing of Information</strong>: We do not share your
            personal information with third parties except as necessary to
            provide our services, comply with the law, or protect our rights.{" "}
          </li>
          <li>
            {" "}
            <strong>Data Security</strong>: We implement reasonable security
            measures to protect your personal information from unauthorized
            access and use.
          </li>
          <li>
            {" "}
            <strong>Your Rights</strong>: You have the right to access, correct,
            or delete your personal information. You can also object to the
            processing of your data in certain circumstances. By using our
            services, you agree to the collection and use of your information as
            described in this Privacy Policy. We may update this policy from
            time to time, and we encourage you to review it periodically. If you
            have any questions or concerns about our Privacy Policy, please
            contact us.
          </li>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}

export default PrivacyPolicyDialog;
