import Header from '@/components/Header';
import { cn } from '@/lib/utils';

interface IProps {
  containerClassName?: string;
  pageClassName?: string;
}

const Page: React.FC<React.PropsWithChildren<IProps>> = ({
  containerClassName,
  children,
  pageClassName,
}) => {
  return (
    <div
      className={cn(
        'relative flex min-h-screen flex-col justify-between bg-background text-foreground terminal-grid-bg selection:bg-primary/30',
        pageClassName
      )}
    >
      {/* Ambient background light aura */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-80 w-[700px] max-w-full rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-60 right-10 -z-10 h-60 w-60 rounded-full bg-amber-500/5 blur-[90px]" />

      <Header />
      {/* Full-width content with a modest gutter around it */}
      <div
        className={cn(
          'flex flex-1 flex-col items-center px-2 pt-3 pb-8 md:px-4',
          containerClassName
        )}
      >
        <div className="flex w-full flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
};

export default Page;
