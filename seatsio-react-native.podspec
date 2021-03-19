require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = "seatsio-react-native"
  s.version      = package['version']
  s.summary      = "Seats.io React Native component for iOS and Android"

  s.authors      = "seats.io"
  s.homepage     = "https://github.com/seatsio/seatsio-react-native"
  s.license      = "MIT"
  s.platform     = :ios, "8.0"

  s.source       = { :git => "https://github.com/seatsio/seatsio-react-native.git", :tag=> "v#{s.version}" }

  s.dependency 'React-Core'
end
