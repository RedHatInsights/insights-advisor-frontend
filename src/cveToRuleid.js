export const cveToRuleid = [
  {
    rule_id: 'CVE_2015_3456|VENOM_CVE_2015_3456',
    name: 'CVE-2015-3456: "VENOM" QEMU privilege escalation',
    description: 'CVE-2015-3456: "VENOM" QEMU privilege escalation',
    cves: ['CVE-2015-3456'],
  },
  {
    rule_id: 'CVE_2015_5600|OPENSSH_CVE_2015_5600',
    name: 'CVE-2015-5600: OpenSSH vulnerable to password guessing attack',
    description:
      'CVE-2015-5600: OpenSSH vulnerable to password guessing attack',
    cves: ['CVE-2015-5600'],
  },
  {
    rule_id: 'CVE_2015_7181_2_3_nss_nspr|NSS_NSPR_CVE_2015_7181_2_3',
    name: 'CVE-2015-7181, CVE-2015-7182, CVE-2015-7183: NSS/NSPR privilege escalation',
    description:
      'CVE-2015-7181, CVE-2015-7182, CVE-2015-7183: NSS/NSPR privilege escalation',
    cves: ['CVE-2015-7181', 'CVE-2015-7182', 'CVE-2015-7183'],
  },
  {
    rule_id:
      'CVE_2015_7501_commons_collections|COMMONS_COLLECTIONS_CVE_2015_7501_IN_USE',
    name: 'CVE-2015-7501: Java application server code execution',
    description: 'CVE-2015-7501: Java application server code execution',
    cves: ['CVE-2015-7501'],
  },
  {
    rule_id: 'CVE_2015_7547_glibc|GLIBC_CVE_2015_7547',
    name: 'CVE-2015-7547: libresolv code execution',
    description: 'CVE-2015-7547: libresolv code execution',
    cves: ['CVE-2015-7547'],
  },
  {
    rule_id: 'CVE_2016_0728_kernel|KERNEL_CVE-2016-0728',
    name: 'CVE-2016-0728: kernel privilege escalation in key management subsystem',
    description:
      'CVE-2016-0728: kernel privilege escalation in key management subsystem',
    cves: ['CVE-2016-0728'],
  },
  {
    rule_id: 'CVE_2016_0800_openssl_drown|OPENSSL_CVE_2016_0800_DROWN',
    name: 'CVE-2016-0800: "DROWN" OpenSSL session decryption',
    description: 'CVE-2016-0800: "DROWN" OpenSSL session decryption',
    cves: ['CVE-2016-0800'],
  },
  {
    rule_id:
      'CVE_2016_0800_openssl_drown|OPENSSL_CVE_2016_0800_DROWN_INT_LISTENING',
    name: 'CVE-2016-0800: "DROWN" OpenSSL session decryption',
    description:
      'CVE-2016-0800: "DROWN" OpenSSL session decryption with listening processes',
    cves: ['CVE-2016-0800'],
  },
  {
    rule_id:
      'CVE_2016_0800_openssl_drown|OPENSSL_CVE_2016_0800_DROWN_LISTENING',
    name: 'CVE-2016-0800: "DROWN" OpenSSL session decryption',
    description:
      'CVE-2016-0800: "DROWN" OpenSSL session decryption with externally available processes',
    cves: ['CVE-2016-0800'],
  },
  {
    rule_id: 'CVE_2016_0800_openssl_drown|OPENSSL_CVE_2016_0800_DROWN_USED',
    name: 'CVE-2016-0800: "DROWN" OpenSSL session decryption',
    description:
      'CVE-2016-0800: "DROWN" OpenSSL session decryption with running services',
    cves: ['CVE-2016-0800'],
  },
  {
    rule_id: 'CVE_2016_0800_openssl_drown|OPENSSL_CVE_2016_0800_SPECIAL_DROWN',
    name: 'CVE-2016-0800: "DROWN" OpenSSL session decryption',
    description:
      'CVE-2016-0800: "Special DROWN" OpenSSL very efficient session decryption',
    cves: ['CVE-2016-0800'],
  },
  {
    rule_id:
      'CVE_2016_0800_openssl_drown|OPENSSL_CVE_2016_0800_SPECIAL_DROWN_LISTEN',
    name: 'CVE-2016-0800: "DROWN" OpenSSL session decryption',
    description:
      'CVE-2016-0800: "Special DROWN" OpenSSL very efficient session decryption with listening processes',
    cves: ['CVE-2016-0800'],
  },
  {
    rule_id:
      'CVE_2016_0800_openssl_drown|OPENSSL_CVE_2016_0800_SPECIAL_DROWN_URGENT',
    name: 'CVE-2016-0800: "DROWN" OpenSSL session decryption',
    description:
      'CVE-2016-0800: "Special DROWN" OpenSSL very efficient session decryption with externally available processes',
    cves: ['CVE-2016-0800'],
  },
  {
    rule_id:
      'CVE_2016_0800_openssl_drown|OPENSSL_CVE_2016_0800_SPECIAL_DROWN_USED',
    name: 'CVE-2016-0800: "DROWN" OpenSSL session decryption',
    description:
      'CVE-2016-0800: "Special DROWN" OpenSSL very efficient session decryption with running services',
    cves: ['CVE-2016-0800'],
  },
  {
    rule_id: 'CVE_2016_2315_24_git|GIT_CVE_2016_2315_24',
    name: 'CVE-2016-2315, CVE-2016-2324: Git code execution via crafted packfile',
    description:
      'CVE-2016-2315, CVE-2016-2324: Git code execution via crafted packfile',
    cves: ['CVE-2016-2315', 'CVE-2016-2324'],
  },
  {
    rule_id: 'CVE_2016_2315_24_git|GIT_DAEMON_CVE_2016_2315_24',
    name: 'CVE-2016-2315, CVE-2016-2324: Git code execution via crafted packfile',
    description:
      'CVE-2016-2315, CVE-2016-2324: Git daemon remote code execution via crafted packfile',
    cves: ['CVE-2016-2315', 'CVE-2016-2324'],
  },
  {
    rule_id: 'CVE_2016_2776_bind|BIND_CVE_2016_2776',
    name: 'CVE-2016-2776: BIND denial of service via crafted DNS request',
    description:
      'CVE-2016-2776: BIND denial of service via crafted DNS request',
    cves: ['CVE-2016-2776'],
  },
  {
    rule_id: 'CVE_2016_3714_imagemagick|IMAGEMAGICK_CVE_2016_3714',
    name: 'CVE-2016-3714: ImageMagick code execution',
    description: 'CVE-2016-3714: ImageMagick code execution',
    cves: ['CVE-2016-3714'],
  },
  {
    rule_id: 'CVE_2016_5195_kernel|KERNEL_CVE_2016_5195_2',
    name: 'CVE-2016-5195: kernel privilege escalation via permission bypass',
    description:
      'CVE-2016-5195: kernel privilege escalation via permission bypass',
    cves: ['CVE-2016-5195'],
  },
  {
    rule_id: 'CVE_2016_5696_kernel|KERNEL_CVE_2016_5696_URGENT',
    name: 'CVE-2016-5696: kernel man-in-the-middle via payload injection',
    description:
      'CVE-2016-5696: kernel man-in-the-middle via payload injection',
    cves: ['CVE-2016-5696'],
  },
  {
    rule_id: 'CVE_2016_5696_kernel|KERNEL_CVE_2016_5696_WARN_2',
    name: 'CVE-2016-5696: kernel man-in-the-middle via payload injection',
    description:
      'CVE-2016-5696: kernel man-in-the-middle via payload injection with incomplete mitigation',
    cves: ['CVE-2016-5696'],
  },
  {
    rule_id: 'CVE_2016_9962_docker|CVE_2015_9962_DOCKER_LESS_SEVERE_2',
    name: 'CVE-2016-9962: Docker privilege escalation via ptrace',
    description: 'CVE-2016-9962: Docker privilege escalation via ptrace',
    cves: ['CVE-2016-9962'],
  },
  {
    rule_id: 'CVE_2016_9962_docker|CVE_2015_9962_DOCKER_MORE_SEVERE_2',
    name: 'CVE-2016-9962: Docker privilege escalation via ptrace',
    description:
      'CVE-2016-9962: Docker efficient privilege escalation via ptrace with outdated package',
    cves: ['CVE-2016-9962'],
  },
  {
    rule_id: 'CVE_2017_1000250_bluez|BLUEZ_CVE_2017_1000250',
    name: 'CVE-2017-1000250: bluez information disclosure',
    description: 'CVE-2017-1000250: bluez information disclosure',
    cves: ['CVE-2017-1000250'],
  },
  {
    rule_id:
      'CVE_2017_1000251_kernel_blueborne|KERNEL_CVE_2017_1000251_LOADED_DOS',
    name: 'CVE-2017-1000251: "Blueborne" kernel code execution',
    description:
      'CVE-2017-1000251: "Blueborne" kernel denial of service with loaded modules',
    cves: ['CVE-2017-1000251'],
  },
  {
    rule_id:
      'CVE_2017_1000251_kernel_blueborne|KERNEL_CVE_2017_1000251_LOADED_RCE',
    name: 'CVE-2017-1000251: "Blueborne" kernel code execution',
    description:
      'CVE-2017-1000251: "Blueborne" kernel code execution with loaded modules',
    cves: ['CVE-2017-1000251'],
  },
  {
    rule_id:
      'CVE_2017_1000251_kernel_blueborne|KERNEL_CVE_2017_1000251_POSSIBLE_DOS',
    name: 'CVE-2017-1000251: "Blueborne" kernel code execution',
    description: 'CVE-2017-1000251: "Blueborne" kernel denial of service',
    cves: ['CVE-2017-1000251'],
  },
  {
    rule_id:
      'CVE_2017_1000251_kernel_blueborne|KERNEL_CVE_2017_1000251_POSSIBLE_RCE',
    name: 'CVE-2017-1000251: "Blueborne" kernel code execution',
    description: 'CVE-2017-1000251: "Blueborne" kernel code execution',
    cves: ['CVE-2017-1000251'],
  },
  {
    rule_id:
      'CVE_2017_1000253_loadelf|KERNEL_CVE_2017_1000253_MITIGATION_INCOMPLETE',
    name: 'CVE-2017-1000253: kernel privilege escalation via SUID PIE binaries',
    description:
      'CVE-2017-1000253: kernel privilege escalation via SUID PIE binaries with incomplete mitigation',
    cves: ['CVE-2017-1000253'],
  },
  {
    rule_id: 'CVE_2017_1000253_loadelf|KERNEL_CVE_2017_1000253_VULNERABLE',
    name: 'CVE-2017-1000253: kernel privilege escalation via SUID PIE binaries',
    description:
      'CVE-2017-1000253: kernel privilege escalation via SUID PIE binaries',
    cves: ['CVE-2017-1000253'],
  },
  {
    rule_id:
      'CVE_2017_1000366_glibc|CVE_2017_1000364_KERNEL_CVE_2017_1000366_GLIBC_EXPLOITABLE',
    name: 'CVE-2017-1000364, CVE-2017-1000366: kernel, glibc privilege escalation',
    description:
      'CVE-2017-1000364, CVE-2017-1000366: kernel, glibc privilege escalation',
    cves: ['CVE-2017-1000364', 'CVE-2017-1000366'],
  },
  {
    rule_id: 'CVE_2017_1000368_sudo|CVE_2017_1000368_SUDO_2',
    name: 'CVE-2017-1000368: sudo privilege escalation due to incomplete bugfix',
    description:
      'CVE-2017-1000368: sudo privilege escalation due to incomplete bugfix',
    cves: ['CVE-2017-1000368'],
  },
  {
    rule_id: 'CVE_2017_1000405_kernel|KERNEL_CVE_2017_1000405_VULNERABLE',
    name: 'CVE-2017-1000405: kernel memory corruption',
    description: 'CVE-2017-1000405: kernel memory corruption',
    cves: ['CVE-2017-1000405'],
  },
  {
    rule_id: 'CVE_2017_12616_tomcat|TOMCAT_CVE_2017_12616_2',
    name: 'CVE-2017-12616: Tomcat information disclosure',
    description: 'CVE-2017-12616: Tomcat information disclosure',
    cves: ['CVE-2017-12616'],
  },
  {
    rule_id: 'CVE_2017_12616_tomcat|TOMCAT_CVE_2017_12616_USED_2',
    name: 'CVE-2017-12616: Tomcat information disclosure',
    description:
      'CVE-2017-12616: Tomcat information disclosure with running process',
    cves: ['CVE-2017-12616'],
  },
  {
    rule_id: 'CVE_2017_13077_wpa_supplicant|CVE_2017_13077_ERROR',
    name: 'CVE-2017-13077: wpa_supplicant man-in-the-middle',
    description:
      'CVE-2017-13077: wpa_supplicant man-in-the-middle with active wifi',
    cves: ['CVE-2017-13077'],
  },
  {
    rule_id: 'CVE_2017_13077_wpa_supplicant|CVE_2017_13077_WARN',
    name: 'CVE-2017-13077: wpa_supplicant man-in-the-middle',
    description: 'CVE-2017-13077: wpa_supplicant man-in-the-middle',
    cves: ['CVE-2017-13077'],
  },
  {
    rule_id: 'CVE_2017_14491_dnsmasq|CVE_2017_14491_ERROR',
    name: 'CVE-2017-14491: dnsmasq code execution',
    description:
      'CVE-2017-14491: dnsmasq code execution with listening processes',
    cves: ['CVE-2017-14491'],
  },
  {
    rule_id: 'CVE_2017_14491_dnsmasq|CVE_2017_14491_WARN',
    name: 'CVE-2017-14491: dnsmasq code execution',
    description: 'CVE-2017-14491: dnsmasq code execution',
    cves: ['CVE-2017-14491'],
  },
  {
    rule_id: 'CVE_2017_2636_kernel|KERNEL_CVE_2017_2636',
    name: 'CVE-2017-2636: kernel privilege escalation',
    description: 'CVE-2017-2636: kernel privilege escalation',
    cves: ['CVE-2017-2636'],
  },
  {
    rule_id: 'CVE_2017_5461_nss|CVE_2017_5461_NSS_2',
    name: 'CVE-2017-5461: NSS code execution',
    description: 'CVE-2017-5461: NSS code execution',
    cves: ['CVE-2017-5461'],
  },
  {
    rule_id: 'CVE_2017_5715_cpu_virt|VIRT_CVE_2017_5715_CPU_3_DRACUTKERNEL',
    name: 'CVE-2017-5715: "Spectre" Virtualization side-channel',
    description:
      'CVE-2017-5715: "Spectre" Virtualization side-channel in dracut and kernel',
    cves: ['CVE-2017-5715'],
  },
  {
    rule_id: 'CVE_2017_5715_cpu_virt|VIRT_CVE_2017_5715_CPU_3_ONLYDRACUT',
    name: 'CVE-2017-5715: "Spectre" Virtualization side-channel',
    description:
      'CVE-2017-5715: "Spectre" Virtualization side-channel in dracut',
    cves: ['CVE-2017-5715'],
  },
  {
    rule_id: 'CVE_2017_5715_cpu_virt|VIRT_CVE_2017_5715_CPU_3_ONLYVIRT',
    name: 'CVE-2017-5715: "Spectre" Virtualization side-channel',
    description: 'CVE-2017-5715: "Spectre" Virtualization side-channel',
    cves: ['CVE-2017-5715'],
  },
  {
    rule_id: 'CVE_2017_5715_cpu_virt|VIRT_CVE_2017_5715_CPU_3_VIRTKERNEL',
    name: 'CVE-2017-5715: "Spectre" Virtualization side-channel',
    description:
      'CVE-2017-5715: "Spectre" Virtualization and kernel side-channel',
    cves: ['CVE-2017-5715'],
  },
  {
    rule_id: 'CVE_2017_5753_4_cpu_kernel|KERNEL_CVE_2017_5753_4_CPU_ERROR_3',
    name: 'CVE-2017-5753, CVE-2017-5754: "Spectre/Meltdown" CPU side-channel',
    description:
      'CVE-2017-5753, CVE-2017-5754: "Spectre/Meltdown" CPU side-channel',
    cves: ['CVE-2017-5753', 'CVE-2017-5754'],
  },
  {
    rule_id: 'CVE_2017_6074_kernel|KERNEL_CVE_2017_6074',
    name: 'CVE-2017-6074: kernel privilege escalation via DCCP module',
    description: 'CVE-2017-6074: kernel privilege escalation via DCCP module',
    cves: ['CVE-2017-6074'],
  },
  {
    rule_id: 'CVE_2017_7184_kernel|KERNEL_CVE_2017_7184_EXPLOITABLE_2',
    name: 'CVE-2017-7184: kernel privilege escalation via CAP_NET_ADMIN capability',
    description:
      'CVE-2017-7184: kernel privilege escalation via CAP_NET_ADMIN capability',
    cves: ['CVE-2017-7184'],
  },
  {
    rule_id: 'CVE_2017_7494_samba|SAMBA_CVE_2017_7494_2',
    name: 'CVE-2017-7494: Samba code execution via writeable share',
    description: 'CVE-2017-7494: Samba code execution via writeable share',
    cves: ['CVE-2017-7494'],
  },
  {
    rule_id: 'CVE_2017_8779_rpc|CVE_2017_8779_BUG',
    name: 'CVE-2017-8779: "rpcbomb" rpcbind denial of service',
    description: 'CVE-2017-8779: "rpcbomb" rpcbind crash with certain versions',
    cves: ['CVE-2017-8779'],
  },
  {
    rule_id: 'CVE_2017_8779_rpc|CVE_2017_8779_VULNERABLE',
    name: 'CVE-2017-8779: "rpcbomb" rpcbind denial of service',
    description: 'CVE-2017-8779: "rpcbomb" rpcbind denial of service',
    cves: ['CVE-2017-8779'],
  },
  {
    rule_id: 'CVE_2017_8779_rpc|CVE_2017_8779_WARN',
    name: 'CVE-2017-8779: "rpcbomb" rpcbind denial of service',
    description: 'CVE-2017-8779: "rpcbomb" rpcbind memory leak',
    cves: ['CVE-2017-8779'],
  },
  {
    rule_id: 'CVE_2018_1000115_memcached|CVE_2018_1000115',
    name: 'CVE-2018-1000115: memcached spoofed traffic amplification',
    description: 'CVE-2018-1000115: memcached spoofed traffic amplification',
    cves: ['CVE-2018-1000115'],
  },
  {
    rule_id: 'CVE_2018_1002105_kubernetes|CVE_2018_1002105_KUBERNETES',
    name: 'CVE-2018-1002105: kubernetes privilege escalation',
    description: 'CVE-2018-1002105: kubernetes privilege escalation',
    cves: ['CVE-2018-1002105'],
  },
  {
    rule_id: 'CVE_2018_1002105_kubernetes|CVE_2018_1002105_KUBERNETES_RUNNING',
    name: 'CVE-2018-1002105: kubernetes privilege escalation',
    description:
      'CVE-2018-1002105: kubernetes privilege escalation with running service',
    cves: ['CVE-2018-1002105'],
  },
  {
    rule_id: 'CVE_2018_1002105_kubernetes|CVE_2018_1002105_KUBERNETES_WONTFIX',
    name: 'CVE-2018-1002105: kubernetes privilege escalation',
    description:
      'CVE-2018-1002105: kubernetes privilege escalation (no fix available for this version)',
    cves: ['CVE-2018-1002105'],
  },
  {
    rule_id:
      'CVE_2018_1002105_kubernetes|CVE_2018_1002105_KUBERNETES_WONTFIX_RUNNING',
    name: 'CVE-2018-1002105: kubernetes privilege escalation',
    description:
      'CVE-2018-1002105: kubernetes privilege escalation with running service (no fix available for this version)',
    cves: ['CVE-2018-1002105'],
  },
  {
    rule_id: 'CVE_2018_1102_ose_sti_builder|OSE_STI_BUILDER_CVE_2018_1102',
    name: 'CVE-2018-1102: OpenShift remote code execution via S2I build',
    description: 'CVE-2018-1102: OpenShift remote code execution via S2I build',
    cves: ['CVE-2018-1102'],
  },
  {
    rule_id: 'CVE_2018_1111_dhcp|ERROR_CVE_2018_1111_DHCP_2',
    name: 'CVE-2018-1111: NetworkManager code execution',
    description:
      'CVE-2018-1111: NetworkManager code execution with DHCP enabled',
    cves: ['CVE-2018-1111'],
  },
  {
    rule_id: 'CVE_2018_1111_dhcp|WARN_CVE_2018_1111_DHCP_2',
    name: 'CVE-2018-1111: NetworkManager code execution',
    description: 'CVE-2018-1111: NetworkManager code execution',
    cves: ['CVE-2018-1111'],
  },
  {
    rule_id: 'CVE_2018_1112_glusterfs|GLUSTERFS_CVE_2018_1112',
    name: 'CVE-2018-1112: glusterfs unrestricted access',
    description: 'CVE-2018-1112: glusterfs unrestricted access',
    cves: ['CVE-2018-1112'],
  },
  {
    rule_id: 'CVE_2018_12130_cpu_kernel|CVE_2018_12130_CPU_KERNEL_BAD_CMDLINE',
    name: 'CVE-2018-12126, CVE-2018-12127, CVE-2018-12130, CVE-2019-11091: "MDS" CPU side-channel',
    description:
      'CVE-2018-12126, CVE-2018-12127, CVE-2018-12130, CVE-2019-11091: "MDS" CPU side-channel mitigation disabled',
    cves: [
      'CVE-2018-12126',
      'CVE-2018-12127',
      'CVE-2018-12130',
      'CVE-2019-11091',
    ],
  },
  {
    rule_id: 'CVE_2018_12130_cpu_kernel|CVE_2018_12130_CPU_KERNEL_NEED_UPDATE',
    name: 'CVE-2018-12126, CVE-2018-12127, CVE-2018-12130, CVE-2019-11091: "MDS" CPU side-channel',
    description:
      'CVE-2018-12126, CVE-2018-12127, CVE-2018-12130, CVE-2019-11091: "MDS" CPU side-channel',
    cves: [
      'CVE-2018-12126',
      'CVE-2018-12127',
      'CVE-2018-12130',
      'CVE-2019-11091',
    ],
  },
  {
    rule_id: 'CVE_2018_12130_cpu_kernel|CVE_2018_12130_CPU_KERNEL_VULNERABLE_2',
    name: 'CVE-2018-12126, CVE-2018-12127, CVE-2018-12130, CVE-2019-11091: "MDS" CPU side-channel',
    description:
      'CVE-2018-12126, CVE-2018-12127, CVE-2018-12130, CVE-2019-11091: "MDS" CPU side-channel reported by kernel',
    cves: [
      'CVE-2018-12126',
      'CVE-2018-12127',
      'CVE-2018-12130',
      'CVE-2019-11091',
    ],
  },
  {
    rule_id: 'CVE_2018_12207_cpu_kernel|CVE_2018_12207_CPU_KERNEL_CMDLINE',
    name: 'CVE-2018-12207: CPU systemwide denial of service',
    description:
      'CVE-2018-12207: CPU systemwide denial of service mitigation disabled',
    cves: ['CVE-2018-12207'],
  },
  {
    rule_id: 'CVE_2018_12207_cpu_kernel|CVE_2018_12207_CPU_KERNEL_FOR_SURE',
    name: 'CVE-2018-12207: CPU systemwide denial of service',
    description: 'CVE-2018-12207: CPU systemwide denial of service',
    cves: ['CVE-2018-12207'],
  },
  {
    rule_id:
      'CVE_2018_12207_cpu_kernel|CVE_2018_12207_CPU_KERNEL_FOR_SURE_CRITICAL',
    name: 'CVE-2018-12207: CPU systemwide denial of service',
    description:
      'CVE-2018-12207: CPU systemwide denial of service with running hypervisor',
    cves: ['CVE-2018-12207'],
  },
  {
    rule_id: 'CVE_2018_14634_kernel|CVE_2018_14634_2',
    name: 'CVE-2018-14634: kernel privilege escalation via SUID-root binary integer overflow',
    description:
      'CVE-2018-14634: kernel privilege escalation via SUID-root binary integer overflow',
    cves: ['CVE-2018-14634'],
  },
  {
    rule_id: 'CVE_2018_19788_polkit|CVE_2018_19788_POLKIT_UID_BAD',
    name: 'CVE-2018-19788: PolicyKit authentication bypass',
    description:
      'CVE-2018-19788: PolicyKit authentication bypass with affected UID',
    cves: ['CVE-2018-19788'],
  },
  {
    rule_id: 'CVE_2018_3620_cpu_kernel|CVE_2018_3620_CPU_KERNEL_BAD_CMDLINE',
    name: 'CVE-2018-3620: "L1TF" CPU side-channel',
    description: 'CVE-2018-3620: "L1TF" CPU side-channel mitigation disabled',
    cves: ['CVE-2018-3620'],
  },
  {
    rule_id: 'CVE_2018_3620_cpu_kernel|CVE_2018_3620_CPU_KERNEL_NEED_UPDATE',
    name: 'CVE-2018-3620: "L1TF" CPU side-channel',
    description: 'CVE-2018-3620: "L1TF" CPU side-channel',
    cves: ['CVE-2018-3620'],
  },
  {
    rule_id: 'CVE_2018_3620_cpu_kernel|CVE_2018_3620_CPU_KERNEL_VULNERABLE_4',
    name: 'CVE-2018-3620: "L1TF" CPU side-channel',
    description: 'CVE-2018-3620: "L1TF" CPU side-channel reported by kernel',
    cves: ['CVE-2018-3620'],
  },
  {
    rule_id: 'CVE_2018_3639_cpu_kernel|CVE_2018_3639_CPU_BAD_CMDLINE_2',
    name: 'CVE-2018-3639: "SSBD" CPU side-channel',
    description:
      'CVE-2018-3639: "SSBD" CPU side-channel mitigation disabled by command line',
    cves: ['CVE-2018-3639'],
  },
  {
    rule_id: 'CVE_2018_3639_cpu_kernel|CVE_2018_3639_CPU_BAD_KERNEL_2',
    name: 'CVE-2018-3639: "SSBD" CPU side-channel',
    description: 'CVE-2018-3639: "SSBD" CPU side-channel',
    cves: ['CVE-2018-3639'],
  },
  {
    rule_id: 'CVE_2018_3639_cpu_kernel|CVE_2018_3639_CPU_BAD_MICROCODE_2',
    name: 'CVE-2018-3639: "SSBD" CPU side-channel',
    description:
      'CVE-2018-3639: "SSBD" CPU side-channel with outdated microcode',
    cves: ['CVE-2018-3639'],
  },
  {
    rule_id: 'CVE_2018_8897_kernel_popss|KERNEL_CVE_2018_8897_VULNERABLE_2',
    name: 'CVE-2018-1087, CVE-2018-8897: "POPSS" kernel privilege escalation',
    description:
      'CVE-2018-1087, CVE-2018-8897: "POPSS" kernel privilege escalation',
    cves: ['CVE-2018-1087', 'CVE-2018-8897'],
  },
  {
    rule_id: 'CVE_2019_0155_gpu_kernel|CVE_2019_0155_GPU_KERNEL',
    name: 'CVE-2019-0154, CVE-2019-0155: i915 GPU privilege escalation',
    description: 'CVE-2019-0154, CVE-2019-0155: i915 GPU privilege escalation',
    cves: ['CVE-2019-0154', 'CVE-2019-0155'],
  },
  {
    rule_id: 'CVE_2019_11135_cpu_taa|CVE_2019_11135_CPU_TAA_BADCMD',
    name: 'CVE-2019-11135: "TAA" kernel side-channel',
    description:
      'CVE-2019-11135: "TAA" kernel side-channel mitigation disabled',
    cves: ['CVE-2019-11135'],
  },
  {
    rule_id: 'CVE_2019_11135_cpu_taa|CVE_2019_11135_CPU_TAA_KERNEL',
    name: 'CVE-2019-11135: "TAA" kernel side-channel',
    description: 'CVE-2019-11135: "TAA" kernel side-channel',
    cves: ['CVE-2019-11135'],
  },
  {
    rule_id: 'CVE_2019_11135_cpu_taa|CVE_2019_11135_CPU_TAA_UCODE',
    name: 'CVE-2019-11135: "TAA" kernel side-channel',
    description:
      'CVE-2019-11135: "TAA" kernel side-channel mitigation incomplete',
    cves: ['CVE-2019-11135'],
  },
  {
    rule_id: 'CVE_2019_1125_kernel|CVE_2019_1125_KERNEL_2',
    name: 'CVE-2019-1125: "SWAPGS" CPU side-channel',
    description: 'CVE-2019-1125: "SWAPGS" CPU side-channel',
    cves: ['CVE-2019-1125'],
  },
  {
    rule_id: 'CVE_2019_1125_kernel|CVE_2019_1125_KERNEL_BAD_CMDLINE_2',
    name: 'CVE-2019-1125: "SWAPGS" CPU side-channel',
    description: 'CVE-2019-1125: "SWAPGS" CPU side-channel mitigation disabled',
    cves: ['CVE-2019-1125'],
  },
  {
    rule_id: 'CVE_2019_11477_kernel|CVE_2019_11477_KERNEL',
    name: 'CVE-2019-11477, CVE-2019-11478, CVE-2019-11479: "Sack Panic" kernel denial of service',
    description:
      'CVE-2019-11477, CVE-2019-11478, CVE-2019-11479: "Sack Panic" kernel denial of service',
    cves: ['CVE-2019-11477', 'CVE-2019-11478', 'CVE-2019-11479'],
  },
  {
    rule_id: 'CVE_2019_14835_kernel|CVE_2019_14835_KERNEL_VULN_BAD',
    name: 'CVE-2019-14835: kernel privilege escalation during guest live migration',
    description:
      'CVE-2019-14835: kernel privilege escalation during guest live migration with virtualization',
    cves: ['CVE-2019-14835'],
  },
  {
    rule_id: 'CVE_2019_14835_kernel|CVE_2019_14835_KERNEL_VULN_NORMAL',
    name: 'CVE-2019-14835: kernel privilege escalation during guest live migration',
    description:
      'CVE-2019-14835: kernel privilege escalation during guest live migration',
    cves: ['CVE-2019-14835'],
  },
  {
    rule_id: 'CVE_2019_5736_runc|CVE_2019_5736_RUNC',
    name: 'CVE-2019-5736: runc privilege escalation',
    description: 'CVE-2019-5736: runc privilege escalation',
    cves: ['CVE-2019-5736'],
  },
  {
    rule_id: 'CVEs_Top10_2015_flash_plugin|FLASH_CVES_TOP_10_2015',
    name: 'Top 10 exploited vulnerabilities in 2015',
    description: 'Top 10 exploited vulnerabilities in 2015',
    cves: ['Top 10 exploited vulnerabilities in 2015'],
  },
  {
    rule_id: 'CVEs_Top10_2016_flash_plugin|FLASH_CVES_TOP_10_2016',
    name: 'Top 10 exploited vulnerabilities in 2016',
    description: 'Top 10 exploited vulnerabilities in 2016',
    cves: ['Top 10 exploited vulnerabilities in 2016'],
  },
  {
    rule_id: 'CVEs_cgi_httpoxy|HTTPD_CVE_2016_5387_3',
    name: 'CVE-2016-5387: "HTTPoxy" httpd man-in-the-middle',
    description: 'CVE-2016-5387: "HTTPoxy" httpd man-in-the-middle',
    cves: ['CVE-2016-5387'],
  },
  {
    rule_id: 'CVEs_cgi_httpoxy|HTTPD_CVE_2016_5387_URGENT_3',
    name: 'CVE-2016-5387: "HTTPoxy" httpd man-in-the-middle',
    description:
      'CVE-2016-5387: "HTTPoxy" httpd man-in-the-middle with listening processes',
    cves: ['CVE-2016-5387'],
  },
  {
    rule_id: 'CVEs_samba_badlock|SAMBA_CVE_2016_2118_CLIENT',
    name: 'CVE-2016-2118: "Badlock" Samba man-in-the-middle',
    description: 'CVE-2016-2118: "Badlock" Samba client man-in-the-middle',
    cves: ['CVE-2016-2118'],
  },
  {
    rule_id: 'CVEs_samba_badlock|SAMBA_CVE_2016_2118_SERVER',
    name: 'CVE-2016-2118: "Badlock" Samba man-in-the-middle',
    description: 'CVE-2016-2118: "Badlock" Samba server man-in-the-middle',
    cves: ['CVE-2016-2118'],
  },
  {
    rule_id: 'bash_injection|VULNERABLE_BASH_DETECTED',
    name: 'CVE-2014-6271, CVE-2014-7169: "Shellshock" Bash privilege escalation',
    description:
      'CVE-2014-6271, CVE-2014-7169: "Shellshock" Bash privilege escalation',
    cves: ['CVE-2014-6271', 'CVE-2014-7169'],
  },
  {
    rule_id: 'hardening_httpd_ssl_pci_dss_poodle|HTTPD_POODLE_4',
    name: 'Decreased security: httpd using deprecated TLS protocol',
    description: 'CVE-2014-3566: "POODLE" SSLv3 man-in-the-middle',
    cves: ['CVE-2014-3566'],
  },
  {
    rule_id: 'heartbleed|HAS_HEARTBLEED',
    name: 'CVE-2014-0160: "Heartbleed" OpenSSL information disclosure',
    description: 'CVE-2014-0160: "Heartbleed" OpenSSL information disclosure',
    cves: ['CVE-2014-0160'],
  },
  {
    rule_id: 'heartbleed|HEARTBLEED_ACCESSIBLE',
    name: 'CVE-2014-0160: "Heartbleed" OpenSSL information disclosure',
    description:
      'CVE-2014-0160: "Heartbleed" OpenSSL with listening processes information disclosure',
    cves: ['CVE-2014-0160'],
  },
  {
    rule_id: 'heartbleed|USING_HEARTBLEED_SO',
    name: 'CVE-2014-0160: "Heartbleed" OpenSSL information disclosure',
    description:
      'CVE-2014-0160: "Heartbleed" OpenSSL with active processes information disclosure',
    cves: ['CVE-2014-0160'],
  },
  {
    rule_id: 'vsftpd_poodle|VSFTPD_POODLE',
    name: 'CVE-2014-3566: "POODLE" vsftpd man-in-the-middle',
    description: 'CVE-2014-3566: "POODLE" vsftpd man-in-the-middle',
    cves: ['CVE-2014-3566'],
  },
];
