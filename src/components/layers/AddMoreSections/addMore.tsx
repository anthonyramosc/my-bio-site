import Links from "./Links/links.tsx";
import TextBox from "./TextBox/textBox.tsx";
import Linked from "./LinkedTiktokFeed/linkedTiktok.tsx";
import Musics from "./Music-Posdcast/music_podcast.tsx";
import Post from "./Socialpost/social_post.tsx";


const Add =() =>{
    return (
        <>

            <div className="mb-6">
                <h3 className="text-gray-300 text-sm font-medium mb-4">Add more sections</h3>

                {/* CONTENT Section */}
                <div className="mb-6">
                    <h4 className="text-gray-400 text-xs font-medium mb-3 uppercase tracking-wider">CONTENT</h4>

                    <Links/>
                    <TextBox/>
                    <Linked/>
                    <Musics/>
                    <Post/>
                </div>
            </div>
        </>
    );
}

export default Add;