#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
import subprocess
import sys
from collections import defaultdict
from collections import namedtuple

Name = namedtuple('Name', 'name desc')
Device = namedtuple('Device', 'name bus alias desc')
Architecture = namedtuple('Architecture', 'name items default')

TARGETS = [
    Name("alpha", "Alpha"),
    Name("arm", "ARM (aarch32)"),
    Name("aarch64", "ARM64 (aarch64)"),
    Name("avr", "AVR"),
    Name("cris", "CRIS"),
    Name("hppa", "HPPA"),
    Name("i386", "i386 (x86)"),
    Name("m68k", "m68k"),
    Name("microblaze", "Microblaze"),
    Name("microblazeel", "Microblaze (Little Endian)"),
    Name("mips", "MIPS"),
    Name("mipsel", "MIPS (Little Endian)"),
    Name("mips64", "MIPS64"),
    Name("mips64el", "MIPS64 (Little Endian)"),
    Name("nios2", "NIOS2"),
    Name("or1k", "OpenRISC"),
    Name("ppc", "PowerPC"),
    Name("ppc64", "PowerPC64"),
    Name("riscv32", "RISC-V32"),
    Name("riscv64", "RISC-V64"),
    Name("rx", "RX"),
    Name("s390x", "S390x (zSeries)"),
    Name("sh4", "SH4"),
    Name("sh4eb", "SH4 (Big Endian)"),
    Name("sparc", "SPARC"),
    Name("sparc64", "SPARC64"),
    Name("tricore", "TriCore"),
    Name("x86_64", "x86_64"),
    Name("xtensa", "Xtensa"),
    Name("xtensaeb", "Xtensa (Big Endian)")
]

DEFAULTS = {
    "aarch64": "virt",
    "arm": "virt",
    "avr": "mega",
    "i386": "q35",
    "rx": "gdbsim-r5f562n7",
    "tricore": "tricore_testboard",
    "x86_64": "q35"
}

AUDIO_SCREAMER = Device('screamer', 'macio', '', 'Screamer (Mac99 only)')
DISPLAY_TCX = Device('tcx', 'none', '', 'Sun TCX')
DISPLAY_CG3 = Device('cg3', 'none', '', 'Sun cgthree')
NETWORK_LANCE = Device('lance', 'none', '', 'Lance (Am7990)')

ADD_DEVICES = {
    "ppc": {
        "Sound devices": set([
            AUDIO_SCREAMER
        ])
    },
    "ppc64": {
        "Sound devices": set([
            AUDIO_SCREAMER
        ])
    },
    "sparc": {
        "Display devices": set([
            DISPLAY_TCX,
            DISPLAY_CG3
        ]),
        "Network devices": set([
            NETWORK_LANCE
        ])
    },
}

HEADER = '''//
// Copyright © 2022 osy. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

// !! THIS FILE IS GENERATED FROM const-gen.py, DO NOT MODIFY MANUALLY !!

import Foundation

'''

def parseListing(listing):
    output = listing.splitlines()[1:]
    result = set()
    for line in output:
        idx = line.find(' ')
        if idx < 0:
            break
        name = line[0:idx]
        description = line[idx:].strip()
        result.add(Name(name, '{} ({})'.format(description, name)))
    return result

def parseDeviceListing(defaults, listing):
    output = listing.splitlines()
    group = ''
    result = defaultdict(set, defaults)
    for line in output:
        if not line:
            continue
        if not line.startswith('name '):
            group = line.rstrip(':')
            continue
        search = re.search('^name "(?P<name>[^"]*)"(?:, bus (?P<bus>[^\s]+))?(?:, alias "(?P<alias>[^"]+)")?(?:, desc "(?P<desc>[^"]+)")?$', line)
        name = search.group('name')
        desc = search.group('desc')
        if not desc:
            desc = name
        else:
            desc = '{} ({})'.format(desc, name)
        item = Device(name, search.group('bus'), search.group('alias'), desc)
        result[group].add(item)
    return result

def parseCpu(listing):
    def parseMips(line):
        search = re.search('^(?P<arch>\S+)\s+\'(?P<name>.+)\'.*', line)
        return Name(search.group('name'), search.group('name'))
    def parseSingle(line):
        name = line.strip()
        return Name(name, name)
    def parseSparc(line):
        search = re.search('^(?P<arch>\S+)\s+(?P<name>.+)\s+IU\s+(?P<iu>\S+)\s+FPU\s+(?P<fpu>\S+)\s+MMU\s+(?P<mmu>\S+)\s+NWINS\s+(?P<nwins>\d+).*$', line)
        return Name(search.group('name'), search.group('name'))
    def parseStandard(line):
        search = re.search('^(?P<arch>\S+)\s+(?P<name>\S+)\s+(?P<desc>.*)?$', line)
        name = search.group('name')
        desc = search.group('desc').strip()
        desc = ' '.join(desc.split())
        if not desc or desc.startswith('(alias'):
            desc = name
        else:
            desc = '{} ({})'.format(desc, name)
        return Name(name, desc)
    def parseSparcFlags(line):
        if line.startswith('Default CPU feature flags') or line.startswith('Available CPU feature flags'):
            flags = line.split(':')[1].strip()
            return [Name(flag, flag) for flag in flags.split(' ')]
        elif line.startswith('Numerical features'):
            return []
        else:
            return None
    def parseS390Flags(line):
        if line.endswith(':'):
            return []
        else:
            flag = line.split(' ')[0]
            return [Name(flag, flag)]
    def parseX86Flags(line):
        flags = []
        for flag in line.split(' '):
            if flag:
                flags.append(Name(flag, flag))
        return flags
    output = enumerate(listing.splitlines())
    cpus = [Name('default', 'Default')]
    flags = []
    if next(output, None) == None:
        return (cpus, flags)
    for (index, line) in output:
        if not line:
            break
        if len(line.strip().split(' ')) == 1:
            cpu = parseSingle(line)
        elif line.startswith('Sparc'):
            cpu = parseSparc(line)
        elif line.startswith('MIPS'):
            cpu = parseMips(line)
        elif parseSparcFlags(line) != None:
            flags += parseSparcFlags(line)
            continue
        else:
            cpu = parseStandard(line)
        if cpu.name != 'default':
            cpus.append(cpu)
    header = next(output, None)
    if header == None:
        return (cpus, flags)
    for (index, line) in output:
        if header[1] == 'Recognized CPUID flags:':
            flags += parseX86Flags(line)
        elif header[1] == 'Recognized feature flags:':
            flags += parseS390Flags(line)
    flags = set(flags) # de-duplicate
    return (cpus, flags)

def sortItems(items):
    return sorted(items, key=lambda item: item.desc if item.desc else item.name)

def getMachines(target, qemu_path):
    output = subprocess.check_output([qemu_path, '-machine', 'help']).decode('utf-8')
    return parseListing(output)

def getDefaultMachine(target, machines):
    if target in DEFAULTS:
        return DEFAULTS[target]
    for machine in machines:
        if "default" in machine.desc:
            return machine.name
    return machines[0].name

def getDevices(target, qemu_path):
    output = subprocess.check_output([qemu_path, '-device', 'help']).decode('utf-8')
    devices = parseDeviceListing(ADD_DEVICES[target.name] if target.name in ADD_DEVICES else {}, output)
    return devices

def getCpus(target, qemu_path):
    output = subprocess.check_output([qemu_path, '-cpu', 'help']).decode('utf-8')
    return parseCpu(output)

def sanitizeName(name):
    sanitized = re.sub('[^0-9a-zA-Z]+', '_', name)
    if len(sanitized) == 0:
        sanitized = '_empty'
    if sanitized[0].isdigit():
        sanitized = '_' + sanitized
    if sanitized in ['default']:
        sanitized = '`' + sanitized + '`'
    return sanitized

def generateEmptyEnum(name):
    output  = f'typealias {name} = AnyQEMUConstant\n'
    output += f'\n'
    return output

def generateEnum(name, values, prettyValues, baseName='QEMUConstant', defaultValue=None):
    if len(values) == 0:
        return generateEmptyEnum(name)
    output  = f'enum {name}: String, CaseIterable, {baseName} {{\n'
    for value in values:
        sanitized = sanitizeName(value)
        if sanitized == value:
            output += f'    case {value}\n'
        else:
            output += f'    case {sanitized} = "{value}"\n'
    output += '\n'
    if defaultValue:
        sanitized = sanitizeName(defaultValue)
        output += f'    static var `default`: {name} {{\n'
        output += f'        .{sanitized}\n'
        output += f'    }}\n'
        output += f'\n'
    output += f'    var prettyValue: String {{\n'
    output += f'        switch self {{\n'
    for value, valuePretty in zip(values, prettyValues):
        sanitized = sanitizeName(value)
        if value in ['default']:
            output += f'        case .{sanitized}: return NSLocalizedString("{valuePretty}", comment: "QEMUConstantGenerated")\n'
        else:
            output += f'        case .{sanitized}: return "{valuePretty}"\n'
    output += f'        }}\n'
    output += f'    }}\n'
    output += f'}}\n'
    output += f'\n'
    return output

def generateArchitectureAtlas(architectures, types):
    output  = f'extension QEMUArchitecture {{\n'
    for k, v in types.items():
        output += f'    var {v}: any {k}.Type {{\n'
        output += f'        switch self {{\n'
        for a in architectures:
            a = sanitizeName(a)
            output += f'        case .{a}: return {k}_{a}.self\n'
        output += f'        }}\n'
        output += f'    }}\n'
        output += f'\n'
    output += f'}}\n'
    output += f'\n'
    return output

def generateEnumForeachArchitecture(name, targetItems, defaults={}):
    output = ''
    for target in targetItems:
        arch = target.name
        className = name + '_' + arch
        sortedItems = sortItems(target.items)
        values = [item.name for item in sortedItems]
        prettyValues = [item.desc for item in sortedItems]
        default = defaults[arch] if arch in defaults else None
        output += generateEnum(className, values, prettyValues, name, default)
    return output

def generate(targets, cpus, cpuFlags, machines, displayDevices, networkDevices, soundDevices, serialDevices):
    targetKeys = [item.name for item in targets]
    output  = HEADER
    output += generateEnum('QEMUArchitecture', targetKeys, [item.desc for item in targets])
    output += generateEnumForeachArchitecture('QEMUCPU', cpus)
    output += generateEnumForeachArchitecture('QEMUCPUFlag', cpuFlags)
    output += generateEnumForeachArchitecture('QEMUTarget', machines, {machine.name: machine.default for machine in machines})
    output += generateEnumForeachArchitecture('QEMUDisplayDevice', displayDevices)
    output += generateEnumForeachArchitecture('QEMUNetworkDevice', networkDevices)
    output += generateEnumForeachArchitecture('QEMUSoundDevice', soundDevices)
    output += generateEnumForeachArchitecture('QEMUSerialDevice', serialDevices)
    output += generateArchitectureAtlas(targetKeys, {
        'QEMUCPU': 'cpuType',
        'QEMUCPUFlag': 'cpuFlagType',
        'QEMUTarget': 'targetType',
        'QEMUDisplayDevice': 'displayDeviceType',
        'QEMUNetworkDevice': 'networkDeviceType',
        'QEMUSoundDevice': 'soundDeviceType',
        'QEMUSerialDevice': 'serialDeviceType',
    })
    return output

def transformDisplayCards(displayCards):
    def transform(item):
        if item.name.endswith('-gl') or '-gl-' in item.name:
            item = Device(item.name, item.bus, item.alias, item.desc + ' (GPU Supported)')
        return item
    return set(map(transform, displayCards))

def main(argv):
    base = argv[1]
    allMachines = []
    allCpus = []
    allCpuFlags = []
    allDisplayCards = []
    allSoundCards = []
    allNetworkCards = []
    allSerialCards = []
    # parse outputs
    for target in TARGETS:
        path = '{}/{}-softmmu/qemu-system-{}'.format(base, target.name, target.name)
        if not os.path.exists(path):
            path = '{}/qemu-system-{}'.format(base, target.name)
            if not os.path.exists(path):
                raise "Invalid path."
        machines = sortItems(getMachines(target, path))
        default = getDefaultMachine(target.name, machines)
        allMachines.append(Architecture(target.name, machines, default))
        devices = getDevices(target, path)

        displayCards = transformDisplayCards(devices["Display devices"])
        allDisplayCards.append(Architecture(target.name, displayCards, None))
        allNetworkCards.append(Architecture(target.name, devices["Network devices"], None))
        nonHdaDevices = [device for device in devices["Sound devices"] if device.bus != 'HDA']
        allSoundCards.append(Architecture(target.name, nonHdaDevices, None))
        serialDevices = [device for device in devices["Input devices"] if 'serial' in device.name]
        allSerialCards.append(Architecture(target.name, serialDevices, None))
        cpus, flags = getCpus(target, path)
        allCpus.append(Architecture(target.name, cpus, 0))
        allCpuFlags.append(Architecture(target.name, flags, 0))
    # generate constants
    print(generate(TARGETS, allCpus, allCpuFlags, allMachines, allDisplayCards, allNetworkCards, allSoundCards, allSerialCards))

if __name__ == "__main__":
    main(sys.argv)
