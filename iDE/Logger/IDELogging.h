// Copyright (c) 2022 Dora Lee
//
// iDE Project
// File Name : IDELogging.h
// Description : Logging Definition for iDE
// Author: Dora Lee <lee@sanghun.io>

#import <Foundation/Foundation.h>
#import "IDELoggingDelegate.h"

NS_ASSUME_NONNULL_BEGIN

void IDELog(NSString *format, ...) NS_FORMAT_FUNCTION(1,2) NS_NO_TAIL_CALL;

@interface IDELogging : NSObject

@property (nonatomic, readonly) NSPipe *standardOutput;
@property (nonatomic, readonly) NSPipe *standardError;
@property (nonatomic, weak) id<IDELoggingDelegate> delegate;

+ (IDELogging *)sharedInstance;

- (void)logToFile:(NSURL *)path;
- (void)endLog;
- (void)writeLine:(NSString *)line;

@end

NS_ASSUME_NONNULL_END
