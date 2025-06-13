import Profile from "./Profile/profile.tsx";
import Social from "./Social/social.tsx";
import Links from "../MySite/Links/links.tsx";
import Style from "./Style/style.tsx";

const MySite = () => {
    return (
        <div className="w-full">
            <div className="space-y-3">
                <Profile />
                <Style />
                <Social />
                <Links />
            </div>
        </div>
    );
}

export default MySite;