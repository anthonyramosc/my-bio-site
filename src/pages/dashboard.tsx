import Add from "../components/layers/AddMoreSections/addMore.tsx";
import MySite from "../components/layers/MySite/Mysite.tsx";
import BioPreview from "../components/layers/BioPreview/BioPreview.tsx";
import UrlDisplay from "../components/layers/UrlDisplay/UrlDisplay.tsx";

const Dashboard = () => {
    return (
        <>
            <UrlDisplay />
            <div className="flex flex-wrap px-6">
                <div className="w-1/2 flex flex-col pr-6">
                    {/*My site*/}
                    <MySite/>
                    <Add/>
                </div>
                <div className="w-1/2">
                    <BioPreview />
                </div>
            </div>
        </>
    );
}

export default Dashboard;