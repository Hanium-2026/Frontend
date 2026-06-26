// Metro 설정: .tflite 모델 파일을 자산으로 번들링한다.
// (react-native-fast-tflite가 require('...tflite')로 모델을 로드함)
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('tflite');

module.exports = config;
