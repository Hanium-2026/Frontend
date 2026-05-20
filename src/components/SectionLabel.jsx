import React from 'react';
import { View, Text } from 'react-native';
import T from '../tokens';

export default function SectionLabel({ children, action }) {
  return (
    <View style={{
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
      paddingHorizontal: 4, paddingTop: 4, paddingBottom: 8,
    }}>
      <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: T.ink2 }}>{children}</Text>
      {action && <Text style={{ fontSize: 12, fontFamily: T.fontSemiBold, color: T.blue }}>{action}</Text>}
    </View>
  );
}
