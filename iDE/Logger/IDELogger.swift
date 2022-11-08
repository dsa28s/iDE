// Copyright (c) 2022 Dora Lee
//
// iDE Project
// File Name : IDELogger.swift
// Description : JIT Manager for IDE (original source from UTM)
// Author: Dora Lee <lee@sanghun.io>

import Logging


let logger = Logger(label: "io.sanghun.IDE") { label in
    var ideLogger = IDELoggingHandler(label: label)
    var stdOutLogger = StreamLogHandler.standardOutput(label: label)
    
    ideLogger.logLevel = .debug
    stdOutLogger.logLevel = .debug
    
    return MultiplexLogHandler([ideLogger, stdOutLogger])
}
