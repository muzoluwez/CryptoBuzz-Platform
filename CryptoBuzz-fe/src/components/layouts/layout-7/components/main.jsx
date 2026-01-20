import { Outlet } from 'react-router-dom';
import { useBodyClass } from '@/hooks/use-body-class';
import { Footer } from './footer';
import { Header } from './header';
import DynamicBanner from '@/components/DynamicBanner';

export function Main() {
  // Using the custom hook to set multiple CSS variables and class properties
  useBodyClass(`
    [--header-height:70px]  
    lg:[--header-height:100px]
    [--header-height-sticky:70px]  
  `);

  return (
    <div className="flex grow flex-col in-data-[header-sticky=on]:pt-(--header-height)">
      <Header />
      <div className="grow" role="content">
        <div className='grid grid-cols-12 gap-4'>
          <div className='col-span-12 md:col-span-2 flex justify-end'>
            <DynamicBanner position="left" />
          </div>
          <div className='col-span-12 px-5 md:col-span-8 md:px-0'>
            <div className='my-6'>
              <Outlet />
            </div>
          </div>
          <div className='col-span-12 md:col-span-2'>
            <DynamicBanner position="right" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
