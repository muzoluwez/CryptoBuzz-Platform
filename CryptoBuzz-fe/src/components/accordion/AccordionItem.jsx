import clsx from 'clsx';
import { memo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
const AccordionItemComponent = ({
  title,
  indicator,
  children,
  isOpen,
  onClick
}) => {
  const buildIndicator = () => {
    return indicator || <span className="accordion-indicator">
          {isOpen ? <ChevronDown className="text-gray-600 text-sm" /> : <ChevronRight className="text-gray-600 text-sm" />}
        </span>;
  };
  return <div className={clsx('accordion-item [&:not(:last-child)]:border-b border-b-gray-200', isOpen && 'active')}>
      <button type="button" className="accordion-toggle py-4 cursor-pointer" onClick={onClick}>
        <span className="text-base text-gray-900">{title}</span>
        {buildIndicator()}
      </button>
      <div className={clsx('accordion-content overflow-hidden transition-all duration-300', isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0')}>
        <div className="text-gray-700 text-md">{children}</div>
      </div>
    </div>;
};
const AccordionItem = memo(AccordionItemComponent);
export { AccordionItem };