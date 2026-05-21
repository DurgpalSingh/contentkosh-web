declare module 'react-day-picker' {
  import type { ComponentType, ComponentPropsWithoutRef } from 'react';

  export type DayPickerMode = 'single' | 'multiple' | 'range';

  export type ChevronProps = React.SVGProps<SVGSVGElement> & {
    orientation?: 'left' | 'right' | 'up' | 'down';
    disabled?: boolean;
  };

  export type DayPickerComponents = {
    PreviousMonthButton?: ComponentType<ComponentPropsWithoutRef<'button'>>;
    NextMonthButton?: ComponentType<ComponentPropsWithoutRef<'button'>>;
    Chevron?: ComponentType<ChevronProps>;
    MonthCaption?: ComponentType<ComponentPropsWithoutRef<'div'>>;
  };

  export type DayPickerLabels = {
    labelPrevious: (date?: Date | null) => string;
    labelNext: (date?: Date | null) => string;
  };

  export type UseDayPickerResult = {
    previousMonth?: Date | null;
    nextMonth?: Date | null;
    goToMonth: (d: Date) => void;
    labels: DayPickerLabels;
    components: DayPickerComponents;
    dayPickerProps: {
      disableNavigation?: boolean;
      dir?: 'ltr' | 'rtl';
    };
  };

  export type DayPickerProps = Omit<ComponentPropsWithoutRef<'div'>, 'onSelect' | 'children'> & {
    mode?: DayPickerMode;
    selected?: Date | Date[] | null;
    onSelect?: (date?: Date | Date[] | null) => void;
    captionLayout?: 'dropdown' | 'buttons' | string;
    fromYear?: number;
    toYear?: number;
    initialFocus?: boolean;
    classNames?: Record<string, string>;
    showOutsideDays?: boolean;
    components?: Partial<DayPickerComponents>;
    hideNavigation?: boolean;
    dir?: 'ltr' | 'rtl';
    className?: string;
  };

  export function DayPicker(props: DayPickerProps): JSX.Element;
  export function useDayPicker(): UseDayPickerResult;

  export default DayPicker;
}
