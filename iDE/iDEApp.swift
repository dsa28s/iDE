import ComposableArchitecture
import SwiftUI

@main
class iDEMain {
    static var jitAvailable = true

    static func main() {
        if jb_spawn_ptrace_child(CommandLine.argc, CommandLine.unsafeArgv) {
            logger.info("JIT: ptrace() child spawn trick")
        } else if jb_has_jit_entitlement() {
            logger.info("JIT: found entitlement")
        } else if jb_has_cs_disabled() {
            logger.info("JIT: CS_KILL disabled")
        } else if jb_has_cs_execseg_allow_unsigned() {
            logger.info("JIT: CS_EXECSEG_ALLOW_UNSIGNED set")
        } else if jb_enable_ptrace_hack() {
            logger.info("JIT: ptrace() hack supported")
        } else {
            logger.info("JIT: ptrace() hack failed")
            jitAvailable = false
        }
        // raise memlimits on jailbroken devices
        if jb_increase_memlimit() {
            logger.info("MEM: successfully removed memory limits")
        }

        iDEApp.main()
    }
}

struct iDEApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView(
                licenseAgreementStore: Store(initialState: LicenseAgreement.State(), reducer: LicenseAgreement())
            )
        }
    }
}
