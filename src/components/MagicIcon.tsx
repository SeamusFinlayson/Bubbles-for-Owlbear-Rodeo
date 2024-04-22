import { SVGProps } from "react";

export default function MagicIcon(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      height="800px"
      width="800px"
      viewBox="0 0 36 36"
    >
      <path
        fill="#FFAC33"
        // fill="#DDDDDD"
        d="M34.347 16.893l-8.899-3.294l-3.323-10.891a1 1 0 0 0-1.912 0l-3.322 10.891l-8.9 3.294a1 1 0 0 0 0 1.876l8.895 3.293l3.324 11.223a1 1 0 0 0 1.918-.001l3.324-11.223l8.896-3.293a.998.998 0 0 0-.001-1.875z"
      ></path>
      <path
        fill="#FFCC4D"
        // fill="white"
        d="M14.347 27.894l-2.314-.856l-.9-3.3a.998.998 0 0 0-1.929-.001l-.9 3.3l-2.313.856a1 1 0 0 0 0 1.876l2.301.853l.907 3.622a1 1 0 0 0 1.94-.001l.907-3.622l2.301-.853a.997.997 0 0 0 0-1.874zM10.009 6.231l-2.364-.875l-.876-2.365a.999.999 0 0 0-1.876 0l-.875 2.365l-2.365.875a1 1 0 0 0 0 1.876l2.365.875l.875 2.365a1 1 0 0 0 1.876 0l.875-2.365l2.365-.875a1 1 0 0 0 0-1.876z"
      ></path>
    </svg>
  );
}