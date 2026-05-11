import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Smartphone, Bell, HeartPulse } from "lucide-react";
import { motion } from "motion/react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import imgOnboarding1 from "../../../imports/Container-4/8f7d12b0e6080bb08df7b546ead3eadbedd88933.png";
import imgOnboarding3 from "../../../imports/Container-2-2/a567b57aa8f66a260db7bcbdfbc9c674fef70bba.png";
import imgScreen1 from "../../../imports/image-1.png";
import imgScreen2 from "../../../imports/image-2.png";
import imgScreen3 from "../../../imports/image-3.png";

export function OnboardingPage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoSlideIndex, setAutoSlideIndex] = useState(0);
  const sliderRef = useRef<Slider>(null);

  useEffect(() => {
    if (currentSlide === 0) {
      const interval = setInterval(() => {
        setAutoSlideIndex((prev) => (prev + 1) % 3);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [currentSlide]);

  const appScreens = [
    { image: imgScreen1, label: "보행 점수 확인" },
    { image: imgScreen2, label: "상세 분석 리포트" },
    { image: imgScreen3, label: "실시간 모니터링" },
  ];

  const slides = [
    {
      title: "나의 보행 점수를 확인해보세요",
      desc: "휴대폰을 소지하고 걸으면 자동으로 보행 상태를 분석해줍니다.",
      image: imgOnboarding1,
      icon: <Smartphone size={100} className="text-slate-300" />,
      layout: "image-bottom",
      hasAutoSlide: true
    },
    {
      title: "위험 상황 발생 시 가족에게 즉시 알립니다",
      desc: "비정상적인 보행 패턴이나 낙상 의심 시 등록된 보호자에게 즉시 알림을 보냅니다.",
      image: null,
      icon: <Bell size={100} className="text-slate-300" />,
      layout: "text-top",
      hasAutoSlide: false
    },
    {
      title: "정확한 AI 분석으로 일상 속 건강 관리",
      desc: "매일 측정되는 데이터를 통해 노인성 질환의 초기 징후를 발견할 수 있습니다.",
      image: imgOnboarding3,
      icon: <HeartPulse size={100} className="text-slate-300" />,
      layout: "text-top-with-image",
      hasAutoSlide: false
    }
  ];

  const settings = {
    dots: false,
    infinite: false,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    beforeChange: (_current: number, next: number) => setCurrentSlide(next),
  };

  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      <div className="flex justify-end px-4 pt-5 shrink-0">
        <button
          onClick={() => navigate("/login")}
          className="text-[#90a1b9] font-semibold px-3 py-1.5 hover:text-slate-600 active:text-slate-800 transition-colors text-sm"
        >
          건너뛰기
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0 px-6">
        <Slider ref={sliderRef} {...settings} className="w-full outline-none flex-1 flex flex-col">
          {slides.map((slide, index) => (
            <div key={index} className="outline-none h-full">
              <div className="flex flex-col h-full pt-2 pb-4">
                <div className="text-left mb-6 shrink-0">
                  <h2 className="text-[1.5rem] font-extrabold text-[#0f172b] mb-2 leading-[1.3] tracking-tight">
                    {slide.title}
                  </h2>
                  <p className="text-[#62748e] text-[1.05rem] font-medium leading-[1.6]">
                    {slide.desc}
                  </p>
                </div>

                <div className="flex-1 flex items-center justify-center min-h-0 mb-6 overflow-hidden relative">
                  {slide.hasAutoSlide && currentSlide === index ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div className="relative w-full h-[420px] flex items-center justify-center">
                        {appScreens.map((screen, screenIdx) => {
                          const isActive = autoSlideIndex === screenIdx;
                          const isPrev = screenIdx === (autoSlideIndex - 1 + appScreens.length) % appScreens.length;
                          const isNext = screenIdx === (autoSlideIndex + 1) % appScreens.length;

                          let xPos = 0;
                          let scale = 0.7;
                          let opacity = 0.3;
                          let zIndex = 0;

                          if (isActive) {
                            xPos = 0; scale = 1; opacity = 1; zIndex = 30;
                          } else if (isPrev) {
                            xPos = -140; scale = 0.75; opacity = 0.5; zIndex = 10;
                          } else if (isNext) {
                            xPos = 140; scale = 0.75; opacity = 0.5; zIndex = 10;
                          } else {
                            xPos = screenIdx < autoSlideIndex ? -300 : 300;
                            scale = 0.6; opacity = 0; zIndex = 5;
                          }

                          return (
                            <motion.div
                              key={screenIdx}
                              initial={{ x: 300, opacity: 0, scale: 0.6 }}
                              animate={{ x: xPos, scale, opacity, zIndex }}
                              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                              className="absolute"
                              style={{ width: '220px', height: '420px' }}
                            >
                              <div className="relative w-full h-full bg-black rounded-[36px] shadow-2xl p-[3px]">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[35%] h-[20px] bg-black rounded-b-[18px] z-10"></div>
                                <div className="relative w-full h-full bg-white rounded-[33px] overflow-hidden">
                                  <img
                                    src={screen.image}
                                    alt={screen.label}
                                    className="w-full h-full object-cover object-top"
                                  />
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, x: 30, scale: 0.95 }}
                      animate={currentSlide === index ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0.3, x: -20, scale: 0.9 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      {slide.image ? (
                        <img
                          src={slide.image}
                          alt=""
                          className="w-auto h-full max-h-[380px] object-contain"
                        />
                      ) : (
                        <div className="w-full bg-[#F3F4F6] rounded-[2rem] flex items-center justify-center max-h-[380px] aspect-[4/4.5] shadow-inner border border-slate-200/50">
                          {slide.icon}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      <div className="flex items-center justify-center space-x-1.5 pb-4 px-6 shrink-0">
        {slides.map((_, dotIdx) => (
          <div
            key={dotIdx}
            className={`h-2 rounded-full transition-all duration-300 ${
              dotIdx === currentSlide ? "w-6 bg-[#155dfc]" : "w-2 bg-[#e2e8f0]"
            }`}
          />
        ))}
      </div>

      <div className="px-6 pb-6 pt-2 shrink-0 bg-white z-10">
        <button
          onClick={() => {
            if (isLastSlide) {
              navigate("/login");
            } else {
              sliderRef.current?.slickNext();
            }
          }}
          className="w-full bg-[#155dfc] active:bg-blue-700 hover:bg-blue-700 text-white font-bold py-4 rounded-[14px] text-lg transition-all"
        >
          {isLastSlide ? "시작하기" : "다음"}
        </button>
      </div>
    </div>
  );
}
