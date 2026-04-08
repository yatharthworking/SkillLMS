import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";

function TermsDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="modal-title">Terms and Conditions</DialogTitle>
      <DialogContent>
        <DialogContentText id="terms-conditions-description">
          Welcome to our platform. By accessing and using our services, you
          agree to comply with and be bound by the following terms and
          conditions:
          <li>
            {" "}
            <strong>Use of Services</strong>: You agree to use our services only
            for lawful purposes and in accordance with these terms. You must not
            use our platform to engage in any unlawful or harmful activities.{" "}
          </li>
          <li>
            {" "}
            <strong>User Accounts</strong>: To access certain features of our
            services, you may be required to create an account. You are
            responsible for maintaining the confidentiality of your account
            information and for all activities that occur under your account.
          </li>
          <li>
            {" "}
            <strong>Intellectual Property</strong>: All content and materials on
            our platform, including but not limited to text, graphics, logos,
            and software, are the property of our company and are protected by
            intellectual property laws. You may not use, reproduce, or
            distribute any content from our platform without our permission.{" "}
          </li>
          <li>
            {" "}
            <strong>Disclaimer of Warranties</strong>: Our services are provided
            "as is" without any warranties of any kind, either express or
            implied. We do not guarantee the accuracy, completeness, or
            reliability of any content on our platform.{" "}
          </li>
          <li>
            {" "}
            <strong>Limitation of Liability</strong>: To the fullest extent
            permitted by law, we shall not be liable for any damages arising
            from your use of our services or inability to use our services.
          </li>
          <li>
            {" "}
            <strong>Changes to Terms</strong>: We reserve the right to modify
            these terms and conditions at any time. Any changes will be
            effective immediately upon posting on our platform. Your continued
            use of our services after such changes constitutes your acceptance
            of the new terms.{" "}
          </li>
          <li>
            {" "}
            <strong>Governing Law</strong>: These terms and conditions are
            governed by and construed in accordance with the laws of [Your
            Jurisdiction]. Any disputes arising out of or related to these terms
            shall be resolved in the courts of [Your Jurisdiction]. By using our
            platform, you acknowledge that you have read, understood, and agree
            to these terms and conditions. If you do not agree, please refrain
            from using our services. If you have any questions or concerns about
            these terms and conditions, please contact us.
          </li>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}

export default TermsDialog;
