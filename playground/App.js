import React from 'react';
import {SeatsioSeatingChart} from '@seatsio/seatsio-react-native';
import {Button, StyleSheet, View} from 'react-native';

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      colorScheme: 'light'
    }
  }

  styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: "column",
    },
    chart: {
      flex: 0.5,
      marginTop: 100
    },
    buttons: {
      flex: 0.5,
      backgroundColor: "#EEE"
    }

  });

  toggleColorScheme() {
    if (this.state.colorScheme === 'light') {
      this.setState({colorScheme: 'dark'})
    } else {
      this.setState({colorScheme: 'light'})
    }
  }

  render() {
    return (
        <View style={this.styles.container}>
          <View style={this.styles.chart}>
            <SeatsioSeatingChart
                workspaceKey="publicDemoKey"
                event={"smallTheatreEvent2"}
                onChartRendered={chart => console.log(chart)}
                pricing={[
                  {'category': 1, 'price': 120},
                  {'category': 2, 'price': 20},
                  {'category': 3, 'price': 50}
                ]}
                priceFormatter={price => '$ ' + price}
                // numberOfPlacesToSelect={2}
                // selectedObjects={['A-8']}
                //  session={"continue"}
                colorScheme={this.state.colorScheme}
                tooltipInfo={object => "[b]This[/b] object's [i]id[/i] is [pre]" + object.label + "[/pre]"}
                objectTooltip={{
                  showActionHint: true,
                  showAvailability: false,
                  showCategory: true,
                  showLabel: true,
                  showPricing: true,
                  showUnavailableNotice: true,
                  stylizedLabel: true,
                  confirmSelectionOnMobile: "auto"
                }}
                language={"fr"}
                messages={{
                  'ORGAN': 'Hello World!'
                }}
                maxSelectedObjects={3}
                // objectColor={(obj, defaultColor, extraConfig) => defaultColor}
                // objectLabel={(object, defaultLabel, extraConfig) => 'abc'}
                // objectIcon={(object, defaultIcon, extraConfig) => 'bullseye'}
                isObjectVisible={(object, extraConfig) => true}
                showRowLabels={false}
                showLegend={true}
                legend={{
                  hideCategoryName: true
                }}
                showActiveSectionTooltipOnMobile={true}
                objectCategory={(object, categories, defaultCategory, extraConfig) => {
                  return categories.get('Stalls');
                }}
                inputDevice={"auto"}
                loading={"<div class='loader'>Loading...</div>"}
            />
          </View>
          <View style={this.styles.buttons}>
            <Button
                title="Toggle color scheme"
                onPress={this.toggleColorScheme.bind(this)}
            />
          </View>
        </View>
    )
  }

}
