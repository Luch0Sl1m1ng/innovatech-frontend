import logo1 from "../../assets/images/logo1.png";
import logo2 from "../../assets/images/logo2.png";
import logo3 from "../../assets/images/logo3.png";

function Reviews() {
  return (
    <div className="bg-white  sm:py-10">
      <div className="mx-auto text-center ">
        <h2 className="text-center text-lg font-semibold leading-8 text-gray-900">
          Empresas que confían en nosotros
        </h2>
        <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          <img
            className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 mx-auto"
            src={logo1}
            alt="Empresa asociada 1"
            width="158"
            height="48"
          />

          <img
            className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 mx-auto"
            src={logo2}
            alt="Empresa asociada 2"
            width="158"
            height="48"
          />
          <img
            className="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1 mx-auto"
            src={logo3}
            alt="Empresa asociada 3"
            width="158"
            height="48"
          />
        </div>
      </div>
    </div>
  );
}

export default Reviews;
