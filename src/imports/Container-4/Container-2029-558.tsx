import svgPaths from "./svg-fqx2k4kbib";
import imgImage1 from "./8f7d12b0e6080bb08df7b546ead3eadbedd88933.png";

function Button() {
  return (
    <div className="h-[40px] relative shrink-0 w-[96px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] font-semibold leading-[24px] left-[48.5px] not-italic text-[#90a1b9] text-[16px] text-center top-[6px] whitespace-nowrap">건너뛰기</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex h-[64px] items-start justify-end left-0 pt-[24px] px-[16px] top-0 w-[374px]" data-name="Container">
      <Button />
    </div>
  );
}

function Container5() {
  return <div className="bg-[#155dfc] h-[8px] rounded-[16777200px] shrink-0 w-[24px]" data-name="Container" />;
}

function Container6() {
  return <div className="bg-[#e2e8f0] rounded-[16777200px] shrink-0 size-[8px]" data-name="Container" />;
}

function Container7() {
  return <div className="bg-[#e2e8f0] rounded-[16777200px] shrink-0 size-[8px]" data-name="Container" />;
}

function Container4() {
  return (
    <div className="absolute content-stretch flex gap-[6px] h-[8px] items-center left-[24px] top-[578px] w-[326px]" data-name="Container">
      <Container5 />
      <Container6 />
      <Container7 />
    </div>
  );
}

function Heading() {
  return <div className="absolute h-[78px] left-[24px] top-[430.75px] w-[326px]" data-name="Heading 2" />;
}

function Paragraph() {
  return <div className="absolute h-[57.203px] left-[24px] top-[520.75px] w-[326px]" data-name="Paragraph" />;
}

function Slider() {
  return (
    <div className="absolute h-[593.953px] left-0 top-0 w-[374px]" data-name="Slider2">
      <Container4 />
      <Heading />
      <p className="absolute font-['Inter:Extra_Bold','Noto_Sans_KR:Black',sans-serif] font-extrabold leading-[39px] left-[18px] not-italic text-[#0f172b] text-[24px] top-[13px] tracking-[-0.75px] w-[326px]">나의 보행 점수를 확인해보세요</p>
      <Paragraph />
      <p className="absolute font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[28.6px] left-[18px] not-italic text-[#62748e] text-[17.6px] top-[67px] w-[326px]">휴대폰을 소지하고 걸으면 자동으로 보행 상태를 분석해줍니다.</p>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[100px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 100 100">
        <g id="Icon">
          <path d={svgPaths.p2f15720} id="Vector" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8.33333" />
          <path d={svgPaths.p344cf7f0} id="Vector_2" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8.33333" />
        </g>
      </svg>
    </div>
  );
}

function OnboardingPage1() {
  return (
    <div className="absolute content-stretch flex h-[366.75px] items-center justify-center left-[24px] px-[113px] py-px rounded-[32px] top-0 w-[326px]" data-name="OnboardingPage">
      <div aria-hidden="true" className="absolute bg-[#f3f4f6] inset-0 pointer-events-none rounded-[32px]" />
      <div aria-hidden="true" className="absolute border border-[rgba(226,232,240,0.5)] border-solid inset-0 pointer-events-none rounded-[32px]" />
      <Icon />
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}

function Container9() {
  return <div className="bg-[#e2e8f0] rounded-[16777200px] shrink-0 size-[8px]" data-name="Container" />;
}

function Container10() {
  return <div className="bg-[#155dfc] h-[8px] rounded-[16777200px] shrink-0 w-[24px]" data-name="Container" />;
}

function Container11() {
  return <div className="bg-[#e2e8f0] rounded-[16777200px] shrink-0 size-[8px]" data-name="Container" />;
}

function Container8() {
  return (
    <div className="absolute content-stretch flex gap-[6px] h-[8px] items-center left-[24px] top-[398.75px] w-[326px]" data-name="Container">
      <Container9 />
      <Container10 />
      <Container11 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="absolute h-[78px] left-[24px] top-[430.75px] w-[326px]" data-name="Heading 2">
      <p className="absolute font-['Inter:Extra_Bold','Noto_Sans_KR:Black',sans-serif] font-extrabold leading-[39px] left-0 not-italic text-[#0f172b] text-[30px] top-[-1.5px] tracking-[-0.75px] w-[326px]">위험 상황 발생 시 가족에게 즉시 알림</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="absolute h-[85.805px] left-[24px] top-[520.75px] w-[326px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[28.6px] left-0 not-italic text-[#62748e] text-[17.6px] top-[-1.5px] w-[326px]">비정상적인 보행 패턴이나 낙상 의심 시 등록된 보호자에게 즉시 알림을 보냅니다.</p>
    </div>
  );
}

function Slider1() {
  return (
    <div className="absolute h-[622.555px] left-[374px] top-0 w-[374px]" data-name="Slider2">
      <OnboardingPage1 />
      <Container8 />
      <Heading1 />
      <Paragraph1 />
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[100px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 100 100">
        <g id="Icon">
          <path d={svgPaths.p194c8e00} id="Vector" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8.33333" />
          <path d={svgPaths.p22665a80} id="Vector_2" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8.33333" />
        </g>
      </svg>
    </div>
  );
}

function OnboardingPage2() {
  return (
    <div className="absolute content-stretch flex h-[366.75px] items-center justify-center left-[24px] px-[113px] py-px rounded-[32px] top-0 w-[326px]" data-name="OnboardingPage">
      <div aria-hidden="true" className="absolute bg-[#f3f4f6] inset-0 pointer-events-none rounded-[32px]" />
      <div aria-hidden="true" className="absolute border border-[rgba(226,232,240,0.5)] border-solid inset-0 pointer-events-none rounded-[32px]" />
      <Icon1 />
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}

function Container13() {
  return <div className="bg-[#e2e8f0] rounded-[16777200px] shrink-0 size-[8px]" data-name="Container" />;
}

function Container14() {
  return <div className="bg-[#e2e8f0] rounded-[16777200px] shrink-0 size-[8px]" data-name="Container" />;
}

function Container15() {
  return <div className="bg-[#155dfc] h-[8px] rounded-[16777200px] shrink-0 w-[24px]" data-name="Container" />;
}

function Container12() {
  return (
    <div className="absolute content-stretch flex gap-[6px] h-[8px] items-center left-[24px] top-[398.75px] w-[326px]" data-name="Container">
      <Container13 />
      <Container14 />
      <Container15 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="absolute h-[78px] left-[24px] top-[430.75px] w-[326px]" data-name="Heading 2">
      <p className="absolute font-['Inter:Extra_Bold','Noto_Sans_KR:Black',sans-serif] font-extrabold leading-[39px] left-0 not-italic text-[#0f172b] text-[30px] top-[-1.5px] tracking-[-0.75px] w-[326px]">정확한 AI 분석으로 일상 속 건강 관리</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="absolute h-[85.805px] left-[24px] top-[520.75px] w-[326px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[28.6px] left-0 not-italic text-[#62748e] text-[17.6px] top-[-1.5px] w-[326px]">매일 측정되는 데이터를 통해 노인성 질환의 초기 징후를 발견할 수 있습니다.</p>
    </div>
  );
}

function Slider2() {
  return (
    <div className="absolute h-[622.555px] left-[748px] top-0 w-[374px]" data-name="Slider2">
      <OnboardingPage2 />
      <Container12 />
      <Heading2 />
      <Paragraph2 />
    </div>
  );
}

function Track() {
  return (
    <div className="h-[623px] relative shrink-0 w-full" data-name="Track2">
      <Slider />
      <Slider1 />
      <Slider2 />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute content-stretch flex flex-col h-[623px] items-start left-0 overflow-clip pr-[-748px] top-[72px] w-[374px]" data-name="Container">
      <Track />
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#155dfc] h-[64px] relative rounded-[14px] shrink-0 w-full" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[28px] left-[163.5px] not-italic text-[20px] text-center text-white top-[16.5px] whitespace-nowrap">다음</p>
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[112px] items-start left-0 pt-[16px] px-[24px] top-[694.55px] w-[374px]" data-name="Container">
      <Button1 />
    </div>
  );
}

function OnboardingPage() {
  return (
    <div className="bg-white h-[806.555px] overflow-clip relative shrink-0 w-full" data-name="OnboardingPage">
      <Container2 />
      <Container3 />
      <Container16 />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col h-[812px] items-start relative shrink-0 w-full" data-name="Container">
      <OnboardingPage />
    </div>
  );
}

function MainContent() {
  return (
    <div className="absolute bg-[#f8fafc] content-stretch flex flex-col h-[828px] items-start left-0 overflow-clip top-0 w-[374px]" data-name="Main Content">
      <Container1 />
    </div>
  );
}

function Button2() {
  return (
    <div className="h-[40px] relative shrink-0 w-[96px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] font-semibold leading-[24px] left-[48.5px] not-italic text-[#90a1b9] text-[16px] text-center top-[6px] whitespace-nowrap">건너뛰기</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="absolute content-stretch flex h-[64px] items-start justify-end left-0 pt-[24px] px-[16px] top-0 w-[374px]" data-name="Container">
      <Button2 />
    </div>
  );
}

function Container21() {
  return <div className="bg-[#155dfc] h-[8px] rounded-[16777200px] shrink-0 w-[24px]" data-name="Container" />;
}

function Container22() {
  return <div className="bg-[#e2e8f0] rounded-[16777200px] shrink-0 size-[8px]" data-name="Container" />;
}

function Container23() {
  return <div className="bg-[#e2e8f0] rounded-[16777200px] shrink-0 size-[8px]" data-name="Container" />;
}

function Container20() {
  return (
    <div className="absolute content-stretch flex gap-[6px] h-[8px] items-center left-[24px] top-[148px] w-[326px]" data-name="Container">
      <Container21 />
      <Container22 />
      <Container23 />
    </div>
  );
}

function Heading3() {
  return <div className="absolute h-[78px] left-[24px] top-[430.75px] w-[326px]" data-name="Heading 2" />;
}

function Paragraph3() {
  return <div className="absolute h-[57.203px] left-[24px] top-[520.75px] w-[326px]" data-name="Paragraph" />;
}

function Slider3() {
  return (
    <div className="absolute h-[593.953px] left-0 top-0 w-[374px]" data-name="Slider2">
      <Container20 />
      <Heading3 />
      <p className="absolute font-['Inter:Extra_Bold','Noto_Sans_KR:Black',sans-serif] font-extrabold leading-[39px] left-[18px] not-italic text-[#0f172b] text-[24px] top-[13px] tracking-[-0.75px] w-[326px]">나의 보행 점수를 확인해보세요</p>
      <Paragraph3 />
      <p className="absolute font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[28.6px] left-[18px] not-italic text-[#62748e] text-[17.6px] top-[67px] w-[326px]">휴대폰을 소지하고 걸으면 자동으로 보행 상태를 분석해줍니다.</p>
      <div className="absolute h-[453px] left-[68px] top-[179px] w-[229px]" data-name="image 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[100px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 100 100">
        <g id="Icon">
          <path d={svgPaths.p2f15720} id="Vector" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8.33333" />
          <path d={svgPaths.p344cf7f0} id="Vector_2" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8.33333" />
        </g>
      </svg>
    </div>
  );
}

function OnboardingPage4() {
  return (
    <div className="absolute content-stretch flex h-[366.75px] items-center justify-center left-[24px] px-[113px] py-px rounded-[32px] top-0 w-[326px]" data-name="OnboardingPage">
      <div aria-hidden="true" className="absolute bg-[#f3f4f6] inset-0 pointer-events-none rounded-[32px]" />
      <div aria-hidden="true" className="absolute border border-[rgba(226,232,240,0.5)] border-solid inset-0 pointer-events-none rounded-[32px]" />
      <Icon2 />
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}

function Container25() {
  return <div className="bg-[#e2e8f0] rounded-[16777200px] shrink-0 size-[8px]" data-name="Container" />;
}

function Container26() {
  return <div className="bg-[#155dfc] h-[8px] rounded-[16777200px] shrink-0 w-[24px]" data-name="Container" />;
}

function Container27() {
  return <div className="bg-[#e2e8f0] rounded-[16777200px] shrink-0 size-[8px]" data-name="Container" />;
}

function Container24() {
  return (
    <div className="absolute content-stretch flex gap-[6px] h-[8px] items-center left-[24px] top-[398.75px] w-[326px]" data-name="Container">
      <Container25 />
      <Container26 />
      <Container27 />
    </div>
  );
}

function Heading4() {
  return (
    <div className="absolute h-[78px] left-[24px] top-[430.75px] w-[326px]" data-name="Heading 2">
      <p className="absolute font-['Inter:Extra_Bold','Noto_Sans_KR:Black',sans-serif] font-extrabold leading-[39px] left-0 not-italic text-[#0f172b] text-[30px] top-[-1.5px] tracking-[-0.75px] w-[326px]">위험 상황 발생 시 가족에게 즉시 알림</p>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="absolute h-[85.805px] left-[24px] top-[520.75px] w-[326px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[28.6px] left-0 not-italic text-[#62748e] text-[17.6px] top-[-1.5px] w-[326px]">비정상적인 보행 패턴이나 낙상 의심 시 등록된 보호자에게 즉시 알림을 보냅니다.</p>
    </div>
  );
}

function Slider4() {
  return (
    <div className="absolute h-[622.555px] left-[374px] top-0 w-[374px]" data-name="Slider2">
      <OnboardingPage4 />
      <Container24 />
      <Heading4 />
      <Paragraph4 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[100px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 100 100">
        <g id="Icon">
          <path d={svgPaths.p194c8e00} id="Vector" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8.33333" />
          <path d={svgPaths.p22665a80} id="Vector_2" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8.33333" />
        </g>
      </svg>
    </div>
  );
}

function OnboardingPage5() {
  return (
    <div className="absolute content-stretch flex h-[366.75px] items-center justify-center left-[24px] px-[113px] py-px rounded-[32px] top-0 w-[326px]" data-name="OnboardingPage">
      <div aria-hidden="true" className="absolute bg-[#f3f4f6] inset-0 pointer-events-none rounded-[32px]" />
      <div aria-hidden="true" className="absolute border border-[rgba(226,232,240,0.5)] border-solid inset-0 pointer-events-none rounded-[32px]" />
      <Icon3 />
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}

function Container29() {
  return <div className="bg-[#e2e8f0] rounded-[16777200px] shrink-0 size-[8px]" data-name="Container" />;
}

function Container30() {
  return <div className="bg-[#e2e8f0] rounded-[16777200px] shrink-0 size-[8px]" data-name="Container" />;
}

function Container31() {
  return <div className="bg-[#155dfc] h-[8px] rounded-[16777200px] shrink-0 w-[24px]" data-name="Container" />;
}

function Container28() {
  return (
    <div className="absolute content-stretch flex gap-[6px] h-[8px] items-center left-[24px] top-[398.75px] w-[326px]" data-name="Container">
      <Container29 />
      <Container30 />
      <Container31 />
    </div>
  );
}

function Heading5() {
  return (
    <div className="absolute h-[78px] left-[24px] top-[430.75px] w-[326px]" data-name="Heading 2">
      <p className="absolute font-['Inter:Extra_Bold','Noto_Sans_KR:Black',sans-serif] font-extrabold leading-[39px] left-0 not-italic text-[#0f172b] text-[30px] top-[-1.5px] tracking-[-0.75px] w-[326px]">정확한 AI 분석으로 일상 속 건강 관리</p>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="absolute h-[85.805px] left-[24px] top-[520.75px] w-[326px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[28.6px] left-0 not-italic text-[#62748e] text-[17.6px] top-[-1.5px] w-[326px]">매일 측정되는 데이터를 통해 노인성 질환의 초기 징후를 발견할 수 있습니다.</p>
    </div>
  );
}

function Slider5() {
  return (
    <div className="absolute h-[622.555px] left-[748px] top-0 w-[374px]" data-name="Slider2">
      <OnboardingPage5 />
      <Container28 />
      <Heading5 />
      <Paragraph5 />
    </div>
  );
}

function Track1() {
  return (
    <div className="h-[623px] relative shrink-0 w-full" data-name="Track2">
      <Slider3 />
      <Slider4 />
      <Slider5 />
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute content-stretch flex flex-col h-[623px] items-start left-0 overflow-clip pr-[-748px] top-[72px] w-[374px]" data-name="Container">
      <Track1 />
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-[#155dfc] h-[64px] relative rounded-[14px] shrink-0 w-full" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[28px] left-[163.5px] not-italic text-[20px] text-center text-white top-[16.5px] whitespace-nowrap">다음</p>
    </div>
  );
}

function Container32() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[112px] items-start left-0 pt-[16px] px-[24px] top-[694.55px] w-[374px]" data-name="Container">
      <Button3 />
    </div>
  );
}

function OnboardingPage3() {
  return (
    <div className="bg-white h-[806.555px] overflow-clip relative shrink-0 w-full" data-name="OnboardingPage">
      <Container18 />
      <Container19 />
      <Container32 />
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col h-[828px] items-start relative shrink-0 w-full" data-name="Container">
      <OnboardingPage3 />
    </div>
  );
}

function MainContent1() {
  return (
    <div className="absolute bg-[#f8fafc] content-stretch flex flex-col h-[828px] items-start left-0 overflow-clip shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-0 w-[374px]" data-name="Main Content">
      <Container17 />
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-white border-8 border-[#0f172b] border-solid overflow-clip relative rounded-[40px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] size-full" data-name="Container">
      <MainContent />
      <MainContent1 />
    </div>
  );
}