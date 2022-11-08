// Copyright (c) 2022 Dora Lee
//
// iDE Project
// File Name : IDEJITManager.h
// Description : JIT Manager for IDE (original source from UTM)
// Author: Dora Lee <lee@sanghun.io>

#ifndef IDEJITManager_h
#define IDEJITManager_h

#include <stdbool.h>

bool jb_has_jit_entitlement(void);
bool jb_has_container(void);
bool jb_has_cs_disabled(void);
bool jb_has_cs_execseg_allow_unsigned(void);
bool jb_enable_ptrace_hack(void);
bool jb_increase_memlimit(void);
bool jb_spawn_ptrace_child(int argc, char **argv);

#endif /* IDEJITManager_h */
