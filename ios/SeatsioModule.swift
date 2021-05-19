//
//  SeatsioModule.swift
//  SeatsioModule
//
//  Copyright © 2021 Seats.io. All rights reserved.
//

import Foundation

@objc(SeatsioModule)
class SeatsioModule: NSObject {
  @objc
  func constantsToExport() -> [AnyHashable : Any]! {
    return ["count": 1]
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
