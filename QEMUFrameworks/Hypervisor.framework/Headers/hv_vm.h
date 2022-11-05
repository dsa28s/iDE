/*
 *  hv_vm.h
 *  Hypervisor Framework
 *
 *  Copyright (c) 2018-2022 Apple Inc. All rights reserved.
 */

#pragma once

#ifdef __arm64__

#include <Hypervisor/hv_base.h>
#include <Hypervisor/hv_vm_types.h>

OS_ASSUME_NONNULL_BEGIN

__BEGIN_DECLS

/*!
 * @function   hv_vm_get_max_vcpu_count
 * @abstract   Return the maximum number of vcpus supported.
 * @param      max_vcpu_count Pointer to the max vcpu count (written on success).
 * @result     HV_SUCCESS on success, an error code otherwise.
 */
API_AVAILABLE(macos(11.0)) 
OS_EXPORT
hv_return_t
hv_vm_get_max_vcpu_count(uint32_t *max_vcpu_count);

/*!
 * @function   hv_vm_create
 * @abstract   Creates a VM instance for the current process.
 * @param      config Configuration. Pass NULL for the default configuration.
 * @result     HV_SUCCESS on success, an error code otherwise.
 */
API_AVAILABLE(macos(11.0)) 
OS_EXPORT
hv_return_t
hv_vm_create(hv_vm_config_t _Nullable config);

/*!
 * @function   hv_vm_destroy
 * @abstract   Destroys the VM instance associated with the current process.
 * @result     HV_SUCCESS on success, an error code otherwise.
 */
API_AVAILABLE(macos(11.0)) 
OS_EXPORT
hv_return_t
hv_vm_destroy(void);

/*!
 * @function   hv_vm_map
 * @abstract   Maps a region in the virtual address space of the current process
 *             into the guest physical address space of the VM.
 * @param      addr   Page aligned virtual address in the current process
 * @param      ipa    Page aligned address in the guest physical address space
 * @param      size   Size in bytes of the region to be mapped (must be a multiple of the page size)
 * @param      flags  READ, WRITE and EXECUTE permissions of the region
 * @result     HV_SUCCESS on success, an error code otherwise.
 */
API_AVAILABLE(macos(11.0)) 
OS_EXPORT
hv_return_t
hv_vm_map(void *addr, hv_ipa_t ipa, size_t size, hv_memory_flags_t flags);

/*!
 * @function   hv_vm_unmap
 * @abstract   Unmaps a region in the guest physical address space of the VM.
 * @param      ipa   Page aligned address in the guest physical address space
 * @param      size  Size in bytes of the region to be unmapped (must be a multiple of the page size)
 * @result     HV_SUCCESS on success, an error code otherwise.
 */
API_AVAILABLE(macos(11.0)) 
OS_EXPORT
hv_return_t
hv_vm_unmap(hv_ipa_t ipa, size_t size);

/*!
 * @function   hv_vm_protect
 * @abstract   Modifies the permissions of a region in the guest physical
 *             address space of the VM.
 * @param      ipa    Page aligned address in the guest physical address space
 * @param      size   Size in bytes of the region to be modified (must be a multiple of the page size)
 * @param      flags  New READ, WRITE and EXECUTE permissions of the region
 * @result     HV_SUCCESS on success, an error code otherwise.
 */
API_AVAILABLE(macos(11.0)) 
OS_EXPORT
hv_return_t
hv_vm_protect(hv_ipa_t ipa, size_t size, hv_memory_flags_t flags);

__END_DECLS

OS_ASSUME_NONNULL_END

#endif
