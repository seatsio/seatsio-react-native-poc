import * as React from 'react'
import { NativeModules } from 'react-native'
import { WebView } from 'react-native-webview'

import { didPropsChange } from './util'

export class SeatsioSeatingChart extends React.Component<SeatsioSeatingChartProps> {
  constructor(props: SeatsioSeatingChartProps) {
    super(props)
  }

  async componentDidUpdate(prevProps: SeatsioSeatingChartProps) {
    if (didPropsChange(this.props, prevProps)) {
      this.destroyChart()
      this.rerenderChart()
    }
  }

  rerenderChart() {
    this.injectJs(
      `chart = new seatsio.SeatingChart(${this.configAsString()}).render();`
    )
  }

  destroyChart() {
    this.injectJs('chart.destroy();')
  }

  injectJs(js: string) {
    // @ts-ignore
    this.webRef.injectJavaScript(js + '; true;')
  }

  render() {
    return (
      <WebView
        // @ts-ignore
        ref={(r) => (this.webRef = r)}
        originWhitelist={['*']}
        source={{ html: this.html() }}
        injectedJavaScriptBeforeContentLoaded={this.pipeConsoleLog()}
        onMessage={this.handleMessage.bind(this)}
      />
    )
  }

  handleMessage(event: any) {
    let message = JSON.parse(event.nativeEvent.data)
    if (message.type === 'log') {
      console.log(message.data)
    } else if (message.type === 'onChartRendered') {
      this.props.onChartRendered(message.data)
    } else if (message.type === 'priceFormatterRequested') {
      let formattedPrice = this.props.priceFormatter(message.data.price)
      this.injectJs(
        `resolvePromise(${message.data.promiseId}, "${formattedPrice}")`
      )
    } else if (message.type === 'tooltipInfoRequested') {
      let tooltipInfo = this.props.tooltipInfo(message.data.object)
      this.injectJs(
        `resolvePromise(${message.data.promiseId}, "${tooltipInfo}")`
      )
    }
  }

  html() {
    return `
            <html lang="en">
            <head>
                <title>seating chart</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <script src="${
                  this.props.chartJsUrl || 'https://cdn.seatsio.net/chart.js'
                }"></script>
            </head>
            <body>
                <script>
                    let promises = [];
                    let promiseCounter = 0;
                    
                    const resolvePromise = (promiseId, data) => {
                        promises[promiseId](data)
                    }
                </script>
                <div id="chart"></div>
                <script>
                    let chart = new seatsio.SeatingChart(${this.configAsString()}).render();
                </script>
            </body>
            </html>
        `
  }

  configAsString() {
    let {
      onChartRendered,
      priceFormatter,
      tooltipInfo,
      objectColor,
      sectionColor,
      objectLabel,
      objectIcon,
      isObjectVisible,
      canGASelectionBeIncreased,
      objectCategory,
      ...config
    } = this.props
    // @ts-ignore
    config.divId = 'chart'
    let configString = JSON.stringify(config).slice(0, -1)
    if (onChartRendered) {
      configString += `
                , "onChartRendered": (chart) => {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: "onChartRendered",
                        data: chart
                    }))
                }
            `
    }
    if (priceFormatter) {
      configString += `
                , "priceFormatter": (price) => {
                    promiseCounter++;
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: "priceFormatterRequested",
                        data: {
                            promiseId: promiseCounter,
                            price: price
                        }
                    }));
                    return new Promise((resolve) => {
                        promises[promiseCounter] = resolve;
                    });
                }
            `
    }
    if (tooltipInfo) {
      configString += `
                , "tooltipInfo": (object) => {
                    promiseCounter++;
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: "tooltipInfoRequested",
                        data: {
                            promiseId: promiseCounter,
                            object: object
                        }
                    }));
                    return new Promise((resolve) => {
                        promises[promiseCounter] = resolve;
                    });
                }
            `
    }
    if (objectColor) {
      configString += `
                , "objectColor": (obj, defaultColor, extraConfig) => {
                        ${objectColor.toString()}
                        return objectColor(obj, defaultColor, extraConfig);
                }
            `
    }
    if (sectionColor) {
      configString += `
                , "sectionColor": (section, defaultColor, extraConfig) => {
                        ${sectionColor.toString()}
                        return sectionColor(section, defaultColor, extraConfig);
                }
            `
    }
    if (objectLabel) {
      configString += `
                , "objectLabel": (object, defaultLabel, extraConfig) => {
                        ${objectLabel.toString()}
                        return objectLabel(object, defaultLabel, extraConfig);
                }
            `
    }
    if (objectIcon) {
      configString += `
                , "objectIcon": (object, defaultIcon, extraConfig) => {
                        ${objectIcon.toString()}
                        return objectIcon(object, defaultIcon, extraConfig);
                }
            `
    }
    if (isObjectVisible) {
      configString += `
                , "isObjectVisible": (object, extraConfig) => {
                        ${isObjectVisible.toString()}
                        return isObjectVisible(object, extraConfig);
                }
            `
    }
    if (canGASelectionBeIncreased) {
      configString += `
                , "canGASelectionBeIncreased": (gaArea, defaultValue, extraConfig, ticketType) => {
                        ${canGASelectionBeIncreased.toString()}
                        return canGASelectionBeIncreased(gaArea, defaultValue, extraConfig, ticketType);
                }
            `
    }
    if (objectCategory) {
      configString += `
                , "objectCategory": (object, categories, defaultCategory, extraConfig) => {
                        ${objectCategory.toString()}
                        return objectCategory(object, categories, defaultCategory, extraConfig);
                }
            `
    }
    configString += '}'
    return configString
  }

  pipeConsoleLog() {
    return `
            console = new Object();
            console.log = function(log) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: "log",
                    data: log
                })));
            };
            console.debug = console.log;
            console.info = console.log;
            console.warn = console.log;
            console.error = console.log;
        `
  }
}

type SeatsioSeatingChartProps = {
  chartJsUrl?: string
  event: string
  workspaceKey: string
  events?: string[]
  onChartRendered?: any
  pricing?: any
  priceFormatter?: any
  numberOfPlacesToSelect?: number
  objectWithoutPricingSelectable?: boolean
  objectWithoutCategorySelectable?: boolean
  selectedObjects?: any
  colorScheme?: string
  tooltipInfo?: any
  objectTooltip?: any
  language?: string
  messages?: any
  maxSelectedObjects?: any
  selectedObjectsInputName?: string
  unavailableCategories?: any
  availableCategories?: any
  selectableObjects?: any
  filteredCategories?: any
  objectColor?: any
  sectionColor?: any
  objectLabel?: any
  objectIcon?: any
  isObjectVisible?: any
  canGASelectionBeIncreased?: any
  showRowLabels?: boolean
  alwaysShowSectionContents?: boolean
  session?: 'continue' | 'manual' | 'start' | 'none'
  holdToken?: string
  holdOnSelectForGAs?: boolean
  showLegend?: boolean
  legend?: any
  multiSelectEnabled?: boolean
  showMinimap?: boolean
  showSectionPricingOverlay?: boolean
  showActiveSectionTooltipOnMobile?: boolean
  showViewFromYourSeatOnMobile?: boolean
  showViewFromYourSeatOnDesktop?: boolean
  selectionValidators?: any
  categories?: any
  categoryFilter?: any
  objectCategories?: any
  objectCategory?: any
  extraConfig?: any
  mode?: string
  inputDevice?: 'auto' | 'cursor' | 'touch'
  loading?: string
  ticketListings?: any
  showZoomOutButtonOnMobile?: boolean
  showFullScreenButton?: boolean
  channels?: any
}

export default NativeModules.SeatsioModule
