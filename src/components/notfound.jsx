import loader from "/logo.svg";

const NotFound = () => (
    <div className="w-screen h-screen flex justify-center items-center bg-black">
        <img className="h-[80%] object-cover" src={loader} alt="Not Found" />
    </div>
);

export default NotFound;