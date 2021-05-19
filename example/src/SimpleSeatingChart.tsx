import * as React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SeatsioSeatingChart } from '@seatsio/seatsio-react-native'

class SimpleSeatingChart extends React.Component {
  render() {
    return (
      <View style={this.styles.container}>
        <ScrollView
          style={StyleSheet.absoluteFill}
          contentContainerStyle={this.styles.scrollview}
        >
          <Text>Simple Seating Chart, no config</Text>
          <View style={this.styles.chart}>
            <SeatsioSeatingChart
              workspaceKey='publicDemoKey'
              event='smallTheatreEvent1'
            />
          </View>
        </ScrollView>
      </View>
    )
  }

  styles = StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    scrollview: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    chart: {
      width: '100%',
      height: 400,
    },
  })
}

export default SimpleSeatingChart
