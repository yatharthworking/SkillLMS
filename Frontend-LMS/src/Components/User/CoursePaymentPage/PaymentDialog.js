import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import "./PaymentDialog.css";

const PaymentDialog = ({ open, onClose, totalAmount, handlePaymentProceed }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const paymentOptions = [
    { method: "Card", type: "", icon: "/path/to/cardcon.png" },
    { method: "UPI / QR", type: "", icon: "/path/to/UPI.png" },
    { method: "Netbanking", type: "All Indian Banks", icon: "/path/to/Netbanking.png" },
    { method: "Wallet", type: "Bajaj Pay & More", icon: "/path/to/Wallet.png" },
    { method: "EMI", type: "EMI via Debit/Credit cards & More", icon: "/path/to/EMI.png" },
    { method: "Pay Later", type: "FlexiPay", icon: "/path/to/FlexiPay.png" }
  ];

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === "backdropClick") {
          // Prevent closing when clicked outside
          return;
        }
      }}
      className="paymentDialog"
    >
      <div className="dialogHeader">
        <div className="title">Acme Corp</div>
        <IconButton className="closeButton" onClick={onClose}>
          <CloseIcon style={{ color: "white" }} />
        </IconButton>
      </div>
      <DialogContent className="dialogContent">
        <div className="paymentOptionHeader">Card, UPI & More</div>
        <div className="paymentOptions">
          {paymentOptions.map((option, index) => (
            <div
              key={index}
              className={`paymentOption ${selectedOption === option.method ? "selected" : ""}`}
              onClick={() => handleOptionSelect(option.method)}
            >
              <div>
                <img src={option.icon} alt="" className="icon" />
              </div>
              <div>
                <div className="payMethod">{option.method}</div>
                <div className="payType">{option.type}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="totalAmount">
          <div>
            {totalAmount !== null ? `₹ ${totalAmount}` : "FREE"}
          </div>
          <Button
            style={{ width: "180px", background: "#0052cc", color: "#fff", fontWeight: '700' }}
            onClick={() => handlePaymentProceed()}
          >
            Pay Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
