import Proptypes from "prop-types";
import "./modal.scoped.scss";
import Button from "../Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function Modal(props) {
  const {
    title,
    children,
    show,
    width,
    height,
    margin,
    onClose,
    close,
    back,
    onBack,
  } = props;
  return (
    <main
      className={`${
        show ? "fixed" : "hidden"
      } inset-x-0 w-full bottom-0 md:top-0 md:inset-0 flex items-center justify-center z-10`}
    >
      <div className="fixed inset-0 cursor-pointer" onClick={onClose}>
        <div className="absolute inset-0 bg-gray-700 opacity-75" />
      </div>
      <section
        role="dialog"
        className={`${height} ${margin} ${width} bg-white rounded-t-lg overflow-hidden shadow-xl transform transition-all w-full rounded-lg px-4 pb-4 p-5
				flex flex-col text-center`}
      >
        <header className="flex flex-row items-center justify-between w-full py-1">
          {back && (
            <section className="px-2">
              <FontAwesomeIcon
                className="text-indigo-600 cursor-pointer"
                onClick={onBack}
                icon={faArrowLeft}
              />
            </section>
          )}
          {title && (
            <section className="flex justify-between w-full">
              <h1 className="text-lg text-center w-full font-semibold">
                {title}
              </h1>
            </section>
          )}
          {close && <Button onClick={onClose}>X</Button>}
        </header>
        {title && <hr className="w-full" />}
        <section className="flex flex-col justify-center items-center py-10">
          {children}
        </section>
      </section>
    </main>
  );
}

Modal.propTypes = {
  title: Proptypes.string,
  show: Proptypes.bool,
  height: Proptypes.oneOf(["auto", "full"]),
  margin: Proptypes.oneOf(["none", "base"]),
  width: Proptypes.oneOf(["sm", "md", "lg"]),
  close: Proptypes.bool,
};

Modal.defaultProps = {
  title: "",
  show: false,
  height: "auto",
  margin: "base",
  width: "md",
  close: false,
};
