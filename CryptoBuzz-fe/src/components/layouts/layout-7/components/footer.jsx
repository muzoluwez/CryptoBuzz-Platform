// import { generalSettings } from '@/config/general.config';

// export function Footer() {
//   const currentYear = new Date().getFullYear();

//   return (
//     <footer className="footer bg-black border-t border-gray-700 mt-10">
//       <div className="container">
//         <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-3 py-5">
//           <div className="flex order-2 md:order-1  gap-2 font-normal text-sm">
//             <span className="text-gray-100">{currentYear} &copy;</span>
//             <a
//               href="https://keenthemes.com"
//               target="_blank"
//               className="text-gray-300 hover:text-gray-200"
//             >
//               CriptoBuzz plateform
//             </a>
//           </div>
//           <nav className="flex order-1 md:order-2 gap-4 font-normal text-sm text-gray-100">
//             <a
//               href={generalSettings.docsLink}
//               target="_blank"
//               className="hover:text-gray-200"
//             >
//               Docs
//             </a>
//             <a
//               href={generalSettings.purchaseLink}
//               target="_blank"
//               className="hover:text-gray-200"
//             >
//               Purchase
//             </a>
//             <a
//               href={generalSettings.faqLink}
//               target="_blank"
//               className="hover:text-gray-200"
//             >
//               FAQ
//             </a>
//             <a
//               href="https://devs.keenthemes.com"
//               target="_blank"
//               className="hover:text-gray-200"
//             >
//               Support
//             </a>
//             <a
//               href={generalSettings.licenseLink}
//               target="_blank"
//               className="hover:text-gray-200"
//             >
//               License
//             </a>
//           </nav>
//         </div>
//       </div>
//     </footer>
//   );
// }


import { FaInstagram, FaLinkedinIn, FaYoutube, FaTiktok, FaXTwitter } from 'react-icons/fa6';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Link } from 'react-router';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-black border-t border-gray-700 text-gray-300">
      <div className=" mx-auto px-6 py-12">
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between gap-10">
          {/* Left Content */}
          <div className="max-w-md">
            <Link to="/client/home">
              <img
                src={toAbsoluteUrl('/media/app/mini-logo-circle-primary-dark.svg')}
                className="dark:hidden h-12"
                alt="logo"
              />

              <img
                src={toAbsoluteUrl('/media/app/mini-logo-circle-primary-dark.svg')}
                className="hidden dark:inline-block h-12"
                alt="logo"
              />
            </Link>
            <p className="text-sm leading-relaxed text-gray-400 mt-5">
              Cripto Buzz is a platform for learning about cryptocurrencies and trading strategies.
            </p>
          </div>

          {/* Right Social Icons */}
          <div className="flex items-start lg:items-center gap-3">
            {[
              FaInstagram,
              FaLinkedinIn,
              FaYoutube,
              FaTiktok,
              FaXTwitter,
            ].map((Icon, index) => (
              <a
                key={index}
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#1a2040] hover:bg-[#1a2040] transition"
              >
                <Icon className="text-white text-lg" />
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p className="text-gray-400 text-center md:text-left">
            © {currentYear} CriptoBuzz. All rights reserved. · Built for
            creators, by creators
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {['FAQ', 'Terms of Service', 'Privacy Policy', 'Cookie Policy'].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  className="hover:text-white transition"
                >
                  {item}
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
