import { Outlet } from 'react-router-dom';
import { useBodyClass } from '@/hooks/use-body-class';
import { Footer } from './footer';
import { Header } from './header';
import imageBanner from "../../../../../public/media/images/add-banner-1.png"
import imageBannerSmall from "../../../../../public/media/images/add-banner-2.png"

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
          <div className='col-span-12 md:col-span-2'>
            <div className="m-2 mt-4 hidden md:block">
              <img src={imageBanner} alt="" />
            </div>
            <div className="m-2 mt-4 block md:hidden">
              <img src={imageBannerSmall} className='w-100 mx-auto' alt="" />
            </div>
          </div>
          <div className='col-span-12 px-5 md:col-span-8 md:px-0'>
            <div className='my-6'>
              <Outlet />
            </div>
          </div>
          <div className='col-span-12 md:col-span-2'>
            <div className="m-2 mt-4 hidden md:block">
              <img src={imageBanner} alt="" />
            </div>
            <div className="m-2 mt-4 block md:hidden">
              <img src={imageBannerSmall} className='w-100 mx-auto' alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
