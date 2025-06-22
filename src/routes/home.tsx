import Container from "@/components/container";
import MarqueImg from "@/components/marque-image";
import { Sparkle } from "lucide-react";
import Marquee from "react-fast-marquee";
import { Link } from 'react-router-dom';
const HomePage = () => {
    return (
        <div className="flex-col w-full pb-24">
            <Container>
                <div className="my-8">
                    <h2 className="text-3xl text-center md:text-left md:text-6xl">
                        <span className="text-outline font-extrabold md:text-8xl">
                            AI Superpower
                        </span>

                        <span className="text-gray-500 font-extrabold">
                            -  A better way to
                        </span>
                        <br />
                        improve your interview chances and skill
                    </h2>
                    <br />

                    <p className="mb-4 text-muted-foreground text-sm">
                        Boost your interview skills and increase your success rate with AI- driven insights. Discover a smarter way to prepare, practice, and stand out.
                    </p>
                </div>

                <div className="flex w-full items-center justify-end md:px-12 md:py">
                    <p className="text-3xl font-semibold text-gray-900 text-center mr-8">
                        250k+
                        <span className="block text-xl text-muted-foreground font-normal">
                            offer Received
                        </span>
                    </p>

                    <p className="text-3xl font-semibold text-gray-900 text-center">1.2M+
                        <span className="block text-xl text-muted-foreground font-normal">
                            Interview Aced

                        </span>
                    </p>
                </div>

                {/* {Image section} */}

                <div className="w-full mt-4 rounded-md bg-gray-100 h-[480px] drop-shadow-sm overflow-hidden">
                    <img
                        src="/assets/img/hero.jpg"
                        alt=""
                        className="w-full h-full object-cover"
                    />

                    <div className="absolute top-4 left-4 py-2 rounded-md bg-gray-300">
                        Interview Copilot&copy;
                    </div>

                    <div className="hidden md:block absolute w-80 bottom-4 right-4 px-4 bg-gray-300 rounded-md">
                        <h2 className="text-neutral-800 font-semibold">Developer</h2>
                        <p className="text-sm text-neutral-500">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit veniam asperiores laborum delectus nulla doloribus accusantium odio eveniet consectetur atque? Cupiditate, inventore distinctio officiis fuga sit placeat hic rem aspernatur?
                        </p>

                        <button className="mt-3 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2 mb-1">
                            Generate <Sparkle />
                        </button>

                    </div>

                </div>
            </Container>

            {/* {marque section} */}
            <div className="w-full my-12">
                <Marquee pauseOnHover>
                    <MarqueImg img="/assets/img/logo/firebase.png" />
                    <MarqueImg img="/assets/img/logo/meet.png" />
                    <MarqueImg img="/assets/img/logo/microsoft.png" />
                    <MarqueImg img="/assets/img/logo/react.png" />
                    <MarqueImg img="/assets/img/logo/tailwindcss.png" />
                    <MarqueImg img="/assets/img/logo/zoom.png" />
                    <MarqueImg img="/assets/img/logo/firebase.png" />
                    <MarqueImg img="/assets/img/logo/meet.png" />
                </Marquee>
            </div>
            <Container className="py-8 space-y-8">
                <h2 className="tracking text-xl text-gray-800 font-semibold">
                    Unleast your potential with personalized AI insights and targated interview practice.
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-gray-100 rounded-md overflow-hidden">
                    <div className="col-span-1 md:col-span-3 h-full">
                        <img
                            src="/assets/img/office.jpg"
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2 p-6 flex flex-col justify-between">
                        <p className="text-gray-600 text-left">
                            Transform the way you prepare, gain confident, and boost your chances of landing your dream job. Let AI be your edge in today&apos;s competative job market.
                        </p>

                        <div className="mt-8 flex justify-center">
                            <Link to={"/generate"} className="w-auto">
                                <button className="w-36 bg-black text-white rounded-md py-2 px-4 flex items-center justify-center">
                                    Generate
                                    <Sparkle className="ml-2" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

            </Container>
        </div>
    )
}

export default HomePage