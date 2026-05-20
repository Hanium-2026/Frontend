import React from 'react';
import Svg, { Circle, Path, Rect, Ellipse, Line, Text as SvgText, G, Defs, Pattern } from 'react-native-svg';

const Icon = {
  walk: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Circle cx="13" cy="4.2" r="1.7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M9 22l2.2-6 -2.7-2.4 1.5-5L7 9.5l-1.5 3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M15 22l-1.5-5.5 -2.5-3 1.6-4 3 3.5h2.2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  home: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M3 11l9-7 9 7v9a1.5 1.5 0 01-1.5 1.5H4.5A1.5 1.5 0 013 20v-9z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M9.5 21.5v-6h5v6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  history: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M3.5 12a8.5 8.5 0 108.5-8.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M3 4v4h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M12 7.5V12l3 2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  bell: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M6 16V11a6 6 0 0112 0v5l1.5 2.5h-15L6 16z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M10 20.5a2.2 2.2 0 004 0" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  user: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Circle cx="12" cy="8" r="3.6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M4.5 20.5c1.4-3.4 4.3-5 7.5-5s6.1 1.6 7.5 5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  heart: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M12 20.5s-7.5-4.2-7.5-10A4.2 4.2 0 0112 6.5 4.2 4.2 0 0119.5 10.5c0 5.8-7.5 10-7.5 10z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  shield: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M12 3l8 3v6c0 5-3.5 8.5-8 9.5-4.5-1-8-4.5-8-9.5V6l8-3z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M8.5 12.5l2.5 2.5 4.5-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  phone: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M5 4.5h3l1.6 4-2 1.5c1 2.2 2.7 3.9 5 5l1.5-2 4 1.6v3a1.5 1.5 0 01-1.5 1.5C9.4 19 5 14.6 5 6a1.5 1.5 0 010-1.5z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  pin: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M12 21.5s-7-6.5-7-12a7 7 0 0114 0c0 5.5-7 12-7 12z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Circle cx="12" cy="9.5" r="2.6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  doc: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M6 3h8l4 4v13.5a1.5 1.5 0 01-1.5 1.5h-10A1.5 1.5 0 015 20.5V4.5A1.5 1.5 0 016.5 3z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M14 3v4h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M8.5 12.5h7M8.5 16h7M8.5 9h3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  chart: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M3.5 20h17" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M6 17V11M10 17V7.5M14 17v-5M18 17V5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  brain: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M9 4.5a2.6 2.6 0 00-2.5 2.6c-1.5.4-2.5 1.8-2.5 3.4 0 1 .4 1.9 1 2.5-.6.6-1 1.5-1 2.5 0 1.7 1.4 3 3.2 3 .4 1.4 1.7 2.5 3.3 2.5V4.5z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M15 4.5a2.6 2.6 0 012.5 2.6c1.5.4 2.5 1.8 2.5 3.4 0 1-.4 1.9-1 2.5.6.6 1 1.5 1 2.5 0 1.7-1.4 3-3.2 3-.4 1.4-1.7 2.5-3.3 2.5V4.5z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  spark: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M12 3v3.5M12 17.5V21M3 12h3.5M17.5 12H21M5.6 5.6l2.5 2.5M15.9 15.9l2.5 2.5M5.6 18.4l2.5-2.5M15.9 8.1l2.5-2.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  sos: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M12 3v3.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M12 21a8 8 0 008-8c0-3-1.5-5.5-4-7M12 21a8 8 0 01-8-8c0-3 1.5-5.5 4-7" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <Circle cx="12" cy="13" r="2.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  plus: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </Svg>
  ),
  check: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M5 12.5l4.5 4.5L19 7" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  arrowRight: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M5 12h14M13 6l6 6-6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  arrowLeft: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M19 12H5M11 6l-6 6 6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  chevron: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M9 6l6 6-6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  more: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" style={style}>
      <Circle cx="6" cy="12" r="1.6" fill={color}/>
      <Circle cx="12" cy="12" r="1.6" fill={color}/>
      <Circle cx="18" cy="12" r="1.6" fill={color}/>
    </Svg>
  ),
  search: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Circle cx="11" cy="11" r="6.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M16 16l4 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  filter: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M4 6h16M7 12h10M10 18h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  share: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M12 3v12M7 8l5-5 5 5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M5 14v5.5a1.5 1.5 0 001.5 1.5h11a1.5 1.5 0 001.5-1.5V14" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  settings: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Circle cx="12" cy="12" r="2.8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M19.4 14.5a1.5 1.5 0 00.3 1.6l.1.1a1.8 1.8 0 11-2.6 2.6l-.1-.1a1.5 1.5 0 00-1.6-.3 1.5 1.5 0 00-.9 1.4V20a1.8 1.8 0 11-3.6 0v-.1a1.5 1.5 0 00-1-1.4 1.5 1.5 0 00-1.6.3l-.1.1a1.8 1.8 0 11-2.6-2.6l.1-.1a1.5 1.5 0 00.3-1.6 1.5 1.5 0 00-1.4-.9H4a1.8 1.8 0 110-3.6h.1a1.5 1.5 0 001.4-1 1.5 1.5 0 00-.3-1.6L5.1 7.5a1.8 1.8 0 112.6-2.6l.1.1a1.5 1.5 0 001.6.3h.1A1.5 1.5 0 0010.4 4V4a1.8 1.8 0 113.6 0v.1a1.5 1.5 0 00.9 1.4 1.5 1.5 0 001.6-.3l.1-.1a1.8 1.8 0 112.6 2.6l-.1.1a1.5 1.5 0 00-.3 1.6V9.4a1.5 1.5 0 001.4.9H20a1.8 1.8 0 110 3.6h-.1a1.5 1.5 0 00-1.4.9z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  family: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Circle cx="8" cy="8" r="2.8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Circle cx="16" cy="8" r="2.8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M3 19c.7-2.6 2.6-4.2 5-4.2s4.3 1.6 5 4.2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M11 19c.7-2.6 2.6-4.2 5-4.2s4.3 1.6 5 4.2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  message: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M4 5.5h16a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5h-9L7 21v-3.5H4a1.5 1.5 0 01-1.5-1.5v-9A1.5 1.5 0 014 5.5z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  refresh: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M4 12a8 8 0 0114-5.3L20 4M20 4v5h-5M20 12a8 8 0 01-14 5.3L4 20M4 20v-5h5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  download: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M12 4v12M7 11l5 5 5-5M5 20h14" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  fall: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Circle cx="8.5" cy="4.5" r="1.6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M6 11l3-2 3 3 4-2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M9 12l-3 5M12 12l3 4M3.5 19h17" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  steps: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Ellipse cx="7.5" cy="8" rx="2.5" ry="3.4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Ellipse cx="16.5" cy="14" rx="2.5" ry="3.4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M5 14a2 2 0 003.5 1.2M19 9.5a2 2 0 00-3.5-1.2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  signal: ({ width = 24, height = 24, color = 'currentColor', style } = {}) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M5 11a9.5 9.5 0 0114 0M8 14a5.5 5.5 0 018 0" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Circle cx="12" cy="17" r="1.4" fill={color}/>
    </Svg>
  ),
};

export default Icon;
