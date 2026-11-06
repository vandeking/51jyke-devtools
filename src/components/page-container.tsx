import type { HTMLAttributes, ReactNode } from "react";

type PageContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function PageContainer({ children, className = "", ...props }: PageContainerProps) {
  return <div className={`mx-auto w-[calc(100%-40px)] sm:w-[calc(100%-48px)] lg:max-w-[1120px] ${className}`.trim()} {...props}>{children}</div>;
}
