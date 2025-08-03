import React from 'react';
import { TbWorld } from "react-icons/tb";
import { MdOutlineSupportAgent } from "react-icons/md";
import { FaClipboardList } from "react-icons/fa";
import { SiAmazonpay } from "react-icons/si";
import { LuTickets } from "react-icons/lu";

const steps = [
  {
    id: "01",
    icon: <TbWorld size={24} />,
    title: "Browse the Web and Select your Package",
  },
  {
    id: "02",
    icon: <MdOutlineSupportAgent size={24} />,
    title: "Reach us via",
    list: ["Web form", "WhatsApp", "Email", "Call us"],
  },
  {
    id: "03",
    icon: <FaClipboardList size={24} />,
    title: "Negotiate and Make Changes As You Wish",
  },
  {
    id: "04",
    icon: <SiAmazonpay size={24} />,
    title: "Pay 10% and Confirm Your Booking",
  },
  {
    id: "05",
    icon: <LuTickets size={24} />,
    title: "Receive Your Trip Confirmation",
  },
];

const Steps = () => {
  return (
    <div className="px-4 py-10 max-w-7xl mx-auto outfit-regular ">
      <h2 className="text-center text-2xl font-bold mb-10 text-black prata-regular  ">How It Works</h2>
      <div className="flex flex-col sm:flex-row flex-wrap justify-between gap-6">
        {steps.map((step, index) => (
          <div key={index} className="flex-1 min-w-[200px] bg-white shadow-md p-6 rounded-xl flex flex-col items-center text-center hover:shadow-lg transition">
            <div className="text-sm font-bold text-green-600 mb-2">Step {step.id}</div>
            <div className="bg-green-100 text-green-700 w-14 h-14 flex items-center justify-center rounded-full mb-3 text-xl">
              {step.icon}
            </div>
            <p className="text-gray-700 text-sm">
              {step.title}
            </p>
            {step.list && (
              <ul className="text-xs text-gray-500 mt-2 space-y-1">
                {step.list.map((item, idx) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Steps;
