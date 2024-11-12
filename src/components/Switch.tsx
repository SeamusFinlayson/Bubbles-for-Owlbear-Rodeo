import { InputHTMLAttributes } from "react";
import "../index.css";

export default function Switch({
  inputProps,
}: {
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
}) {
  return (
    <>
      <label className="flex cursor-pointer select-none items-center">
        <div className="relative">
          <input {...inputProps} type="checkbox" className="peer sr-only" />
          <div className="h-[26px] w-[45px] rounded-full bg-[#f4f1f1] p-1 shadow-sm transition duration-200 ease-in-out peer-checked:bg-[#c5acfc] peer-focus-visible:ring-2 peer-focus-visible:ring-primary dark:bg-black/35 dark:shadow-none dark:peer-checked:bg-[#74649f] dark:peer-focus-visible:ring-primary-dark"></div>
          <div
            className={
              "absolute left-[4px] top-[4px] size-[18px] rounded-full bg-[#ffffff] shadow transition peer-checked:translate-x-[19px] peer-checked:bg-[#9966ff] dark:bg-[#e0e0e0]/80 dark:peer-checked:bg-[#ccb3ff]"
            }
          ></div>
        </div>
      </label>
    </>
  );
}
