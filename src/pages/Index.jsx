import Layout from "../layout/Layout";
import { BsPlay, BsPatchCheck, BsSearch, BsBookmarkCheck, BsShieldCheck, BsLaptop } from "react-icons/bs";

const Index = () => {

    const features = [
        {
            icon: <BsPlay />,
            title: "Start Watching",
            description: "Click on any anime and start streaming instantly without waiting."
        },
        {
            icon: <BsPatchCheck />,
            title: "Enjoy Seamlessly",
            description: "Sit back, relax, and enjoy a seamless streaming experience."
        },
        {
            icon: <BsSearch />,
            title: "Browse Content",
            description: "Find your favorite anime quickly with our easy-to-use search features."
        },
        {
            icon: <BsBookmarkCheck />,
            title: "Watchlist",
            description: "Save your favorite anime and episodes for easy access later."
        },
        {
            icon: <BsShieldCheck />,
            title: "Secure Streaming",
            description: "Your data is always protected with our state-of-the-art security measures."
        },
        {
            icon: <BsLaptop />,
            title: "Cross-Platform Support",
            description: "Watch on any device—whether it’s your phone, tablet, or desktop."
        }
    ];

    return (
        <Layout>
            <section className="py-10">
                <div className="container mx-auto px-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
                        {features.map((feature, index) => (
                            <div className="text-center" key={index}>
                                <div className="bg-orange rounded-full p-6 inline-block mb-4 text-4xl">
                                    {feature.icon}
                                </div>
                                <h1 className="text-xl font-semibold mb-2">{feature.title}</h1>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Index;