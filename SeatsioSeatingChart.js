import {WebView} from 'react-native-webview';
import React from 'react';
import PropTypes from 'prop-types';

class SeatsioSeatingChart extends React.Component {
    constructor(props) {
        super(props);
        this.divId = 'chart';
    }

    async componentDidUpdate(prevProps) {
        if (this.didPropsChange(this.props, prevProps)) {
            this.injectJs('chart.destroy();');
            this.injectJs(`chart = new seatsio.SeatingChart(${this.configAsString()}).render();`);
        }
    }

    render() {
        return (
            <WebView
                ref={r => (this.webRef = r)}
                originWhitelist={['*']}
                source={{html: this.html()}}
                injectedJavaScriptBeforeContentLoaded={this.pipeConsoleLog()}
                onMessage={this.handleMessage.bind(this)}
            />
        );
    }

    injectJs(js) {
        this.webRef.injectJavaScript(js + '; true;');
    }

    didPropsChange(prevProps, nextProps) {
        if (Object.keys(prevProps).length !== Object.keys(nextProps).length) {
            return true;
        }
        return Object.keys(nextProps).some(propName => {
            let prevValue = prevProps[propName];
            let nextValue = nextProps[propName];
            if (prevValue && nextValue) {
                if (typeof prevValue === 'function' && typeof nextValue === 'function') {
                    return prevValue.toString() !== nextValue.toString();
                }
                if (typeof prevValue === 'object' && typeof nextValue === 'object') {
                    return this.didPropsChange(prevValue, nextValue);
                }
            }
            return prevValue !== nextValue;
        });
    }

    handleMessage(event) {
        let message = JSON.parse(event.nativeEvent.data);
        if (message.type === 'log') {
            console.log(message.data);
        } else if (message.type === 'onChartRendered') {
            this.props.onChartRendered(message.data);
        } else if (message.type === 'priceFormatterRequested') {
            let formattedPrice = this.props.priceFormatter(message.data.price);
            this.injectJs(
                `resolvePromise(${message.data.promiseId}, "${formattedPrice}")`
            );
        } else if (message.type === 'tooltipInfoRequested') {
            let tooltipInfo = this.props.tooltipInfo(message.data.object);
            this.injectJs(
                `resolvePromise(${message.data.promiseId}, "${tooltipInfo}")`
            );
        }
    }

    html() {
        return `
            <html lang="en">
            <head>
                <title>seating chart</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <script src="${this.props.chartJsUrl}"></script>
            </head>
            <body>
                <script>
                    let promises = [];
                    let promiseCounter = 0;
                    
                    const resolvePromise = (promiseId, data) => {
                        promises[promiseId](data)
                    }
                </script>
                <div id="${this.divId}"></div>
                <script>
                    let chart = new seatsio.SeatingChart(${this.configAsString()}).render();
                </script>
            </body>
            </html>
        `;
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
        } = this.props;
        config.divId = this.divId;
        let configString = JSON.stringify(config).slice(0, -1);
        if (onChartRendered) {
            configString += `
                , "onChartRendered": (chart) => {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: "onChartRendered",
                        data: chart
                    }))
                }
            `;
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
            `;
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
            `;
        }
        if (objectColor) {
            configString += `
                , "objectColor": (obj, defaultColor, extraConfig) => {
                        ${objectColor.toString()}
                        return objectColor(obj, defaultColor, extraConfig);
                }
            `;
        }
        if (sectionColor) {
            configString += `
                , "sectionColor": (section, defaultColor, extraConfig) => {
                        ${sectionColor.toString()}
                        return sectionColor(section, defaultColor, extraConfig);
                }
            `;
        }
        if (objectLabel) {
            configString += `
                , "objectLabel": (object, defaultLabel, extraConfig) => {
                        ${objectLabel.toString()}
                        return objectLabel(object, defaultLabel, extraConfig);
                }
            `;
        }
        if (objectIcon) {
            configString += `
                , "objectIcon": (object, defaultIcon, extraConfig) => {
                        ${objectIcon.toString()}
                        return objectIcon(object, defaultIcon, extraConfig);
                }
            `;
        }
        if (isObjectVisible) {
            configString += `
                , "isObjectVisible": (object, extraConfig) => {
                        ${isObjectVisible.toString()}
                        return isObjectVisible(object, extraConfig);
                }
            `;
        }
        if (canGASelectionBeIncreased) {
            configString += `
                , "canGASelectionBeIncreased": (gaArea, defaultValue, extraConfig, ticketType) => {
                        ${canGASelectionBeIncreased.toString()}
                        return canGASelectionBeIncreased(gaArea, defaultValue, extraConfig, ticketType);
                }
            `;
        }
        if (objectCategory) {
            configString += `
                , "objectCategory": (object, categories, defaultCategory, extraConfig) => {
                        ${objectCategory.toString()}
                        return objectCategory(object, categories, defaultCategory, extraConfig);
                }
            `;
        }
        configString += '}';
        return configString;
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
        `;
    }
}

SeatsioSeatingChart.defaultProps = {
    // change this to your region url, e.g. https://cdn-na.seatsio.net/chart.js for North America (See https://docs.seats.io/docs/event-manager/how-to-embed/)
    chartJsUrl: 'https://cdn-eu.seatsio.net/chart.js'
};

SeatsioSeatingChart.propTypes = {
    event: PropTypes.string,
    events: PropTypes.array,
    workspaceKey: PropTypes.string.isRequired,
    onChartRendered: PropTypes.func,
    pricing: PropTypes.array,
    priceFormatter: PropTypes.func,
    numberOfPlacesToSelect: PropTypes.number,
    objectWithoutPricingSelectable: PropTypes.bool,
    objectWithoutCategorySelectable: PropTypes.bool,
    selectedObjects: PropTypes.array,
    colorScheme: PropTypes.string,
    tooltipInfo: PropTypes.func,
    objectTooltip: PropTypes.object,
    language: PropTypes.string,
    messages: PropTypes.object,
    maxSelectedObjects: PropTypes.oneOfType([PropTypes.number, PropTypes.array]),
    selectedObjectsInputName: PropTypes.string,
    unavailableCategories: PropTypes.array,
    availableCategories: PropTypes.array,
    selectableObjects: PropTypes.array,
    filteredCategories: PropTypes.array,
    objectColor: PropTypes.func,
    sectionColor: PropTypes.func,
    objectLabel: PropTypes.func,
    objectIcon: PropTypes.func,
    isObjectVisible: PropTypes.func,
    canGASelectionBeIncreased: PropTypes.func,
    showRowLabels: PropTypes.bool,
    alwaysShowSectionContents: PropTypes.bool,
    session: PropTypes.oneOf(['continue', 'manual', 'start', 'none']),
    holdToken: PropTypes.string,
    holdOnSelectForGAs: PropTypes.bool,
    showLegend: PropTypes.bool,
    legend: PropTypes.object,
    multiSelectEnabled: PropTypes.bool,
    showMinimap: PropTypes.bool,
    showSectionPricingOverlay: PropTypes.bool,
    showActiveSectionTooltipOnMobile: PropTypes.bool,
    showViewFromYourSeatOnMobile: PropTypes.bool,
    showViewFromYourSeatOnDesktop: PropTypes.bool,
    selectionValidators: PropTypes.array,
    categories: PropTypes.array,
    categoryFilter: PropTypes.object,
    objectCategories: PropTypes.object,
    objectCategory: PropTypes.func,
    extraConfig: PropTypes.object,
    mode: PropTypes.string,
    inputDevice: PropTypes.oneOf(['auto', 'cursor', 'touch']),
    loading: PropTypes.string,
    ticketListings: PropTypes.array,
    showZoomOutButtonOnMobile: PropTypes.bool,
    showFullScreenButton: PropTypes.bool,
    channels: PropTypes.array
};

export default SeatsioSeatingChart;
