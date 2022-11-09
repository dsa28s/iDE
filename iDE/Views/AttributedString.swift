// Copyright (c) 2022 Dora Lee
//
// iDE Project
// File Name : AttributedText.swift
// Description : NSAttributedString bindings for Swift UI
// Author: Dora Lee <lee@sanghun.io>

import SwiftUI

extension Text {
    init(html htmlString: String,
         raw: Bool = false,
         size: CGFloat? = nil,
         fontFamily: String = "-apple-system")
    {
        let fullHTML: String
        if raw {
            fullHTML = htmlString
        } else {
            var sizeCss = ""
            if let size = size {
                sizeCss = "font-size: \(size)px;"
            }
            fullHTML = """
            <!doctype html>
            <html>
              <head>
                <style>
                  body {
                    font-family: \(fontFamily);
                    \(sizeCss)
                  }
                </style>
              </head>
              <body>
                \(htmlString)
              </body>
            </html>
            """
        }
        let attributedString: NSAttributedString
        if let data = fullHTML.data(using: .unicode),
           let attrString = try? NSAttributedString(data: data,
                                                    options: [.documentType: NSAttributedString.DocumentType.html],
                                                    documentAttributes: nil)
        {
            attributedString = attrString
        } else {
            attributedString = NSAttributedString()
        }

        self.init(attributedString)
    }

    init(_ attributedString: NSAttributedString) {
        self.init("")

        attributedString.enumerateAttributes(in: NSRange(location: 0, length: attributedString.length), options: []) { attrs, range, _ in
            let string = attributedString.attributedSubstring(from: range).string
            var text = Text(string)

            if let font = attrs[.font] as? UIFont {
                if font.fontName.lowercased().contains("bold") {
                    text = text.fontWeight(.bold)
                }
            }

            if let color = attrs[.foregroundColor] as? UIColor {
                text = text.foregroundColor(Color(color))
            }

            if let kern = attrs[.kern] as? CGFloat {
                text = text.kerning(kern)
            }

            if #available(iOS 14.0, *) {
                if let tracking = attrs[.tracking] as? CGFloat {
                    text = text.tracking(tracking)
                }
            }

            if let strikethroughStyle = attrs[.strikethroughStyle] as? NSNumber, strikethroughStyle != 0 {
                if let strikethroughColor = (attrs[.strikethroughColor] as? UIColor) {
                    text = text.strikethrough(true, color: Color(strikethroughColor))
                } else {
                    text = text.strikethrough(true)
                }
            }

            if let underlineStyle = attrs[.underlineStyle] as? NSNumber,
               underlineStyle != 0
            {
                if let underlineColor = (attrs[.underlineColor] as? UIColor) {
                    text = text.underline(true, color: Color(underlineColor))
                } else {
                    text = text.underline(true)
                }
            }

            if let baselineOffset = attrs[.baselineOffset] as? NSNumber {
                text = text.baselineOffset(CGFloat(baselineOffset.floatValue))
            }

            self = self + text
        }
    }
}
