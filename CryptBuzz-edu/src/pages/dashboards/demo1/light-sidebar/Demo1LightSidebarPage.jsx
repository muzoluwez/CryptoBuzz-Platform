import { Fragment, useRef, useState } from 'react';
import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading } from '@/layouts/demo1/toolbar';
import { Demo1LightSidebarContent } from './';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { addDays } from 'date-fns';

const Demo1LightSidebarPage = () => {
  const [date, setDate] = useState({
    from: new Date(2025, 0, 20),
    to: addDays(new Date(2025, 0, 20), 20)
  });
  return <Fragment>
    <Container>
      <Toolbar>
        <ToolbarHeading title="Dashboard" description="Central Hub for Personal Customization" />
        <ToolbarActions>
          <Popover>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
            </PopoverContent>
          </Popover>
        </ToolbarActions>
      </Toolbar>
    </Container>

    <Container>
      <Demo1LightSidebarContent />
    </Container>
  </Fragment>;
};
export { Demo1LightSidebarPage };


