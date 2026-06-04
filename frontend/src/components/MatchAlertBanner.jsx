import React from "react";
export default function MatchAlertBanner({ message, onClose }) {
  return <div className="fixed bottom-5 right-5 max-w-sm rounded-xl bg-orange p-4 text-white shadow-lg"><button className="float-right font-bold" onClick={onClose}>x</button>{message}</div>;
}

