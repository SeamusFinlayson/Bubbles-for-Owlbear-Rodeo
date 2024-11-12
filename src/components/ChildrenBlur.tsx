import { useCallback } from "react";

export default function ChildrenBlur({
  children,
  onBlur,
  ...props
}: {
  children: any;
  onBlur: () => void;
  props?: any;
}) {
  const handleBlur = useCallback(
    (e: any) => {
      console;
      const currentTarget = e.currentTarget;

      // Give browser time to focus the next element
      requestAnimationFrame(() => {
        // Check if the new focused element is a child of the original container
        if (!currentTarget.contains(document.activeElement)) {
          // console.log(
          //   "has focus",
          //   currentTarget.contains(document.activeElement),
          // );
          onBlur();
        }
      });
    },
    [onBlur],
  );

  return (
    <div {...props} onBlur={handleBlur} tabIndex={-1}>
      {children}
    </div>
  );
}
