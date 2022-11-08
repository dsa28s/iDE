// Copyright (c) 2022 Dora Lee
//
// iDE Project
// File Name : IDELoggingDelegate.h
// Description : Logger Delegate for iDE Global Logger
// Author: Dora Lee <lee@sanghun.io>

#import <Foundation/Foundation.h>

@class IDELogging;

NS_ASSUME_NONNULL_BEGIN

@protocol IDELoggingDelegate <NSObject>

- (void)logging:(IDELogging *)logging didRecieveOutputLine:(NSString *)line;
- (void)logging:(IDELogging *)logging didRecieveErrorLine:(NSString *)line;

@end

NS_ASSUME_NONNULL_END
