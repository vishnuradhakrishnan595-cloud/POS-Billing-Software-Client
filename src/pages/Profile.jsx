import { useState } from 'react';
import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  LockKeyhole,
  Save,
  KeyRound,
  CircleUserRound,
  CheckCircle2,
} from 'lucide-react';

import { authService } from '../services/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

import {
  Badge,
  Button,
  Card,
  Input,
} from '../components/ui.jsx';

import { getApiErrorMessage } from '../utils/format.js';

export default function Profile() {
  const { user, saveUser } = useAuth();
  const toast = useToast();

  // =========================================================
  // PROFILE STATE
  // =========================================================

  const [p, setP] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // =========================================================
  // PASSWORD STATE
  // =========================================================

  const [pw, setPw] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [b1, setB1] = useState(false);
  const [b2, setB2] = useState(false);

  // =========================================================
  // PROFILE UPDATE
  // =========================================================

  const save = async (e) => {
    e.preventDefault();

    setB1(true);

    try {
      const updated = await authService.updateProfile(p);

      saveUser({
        ...user,
        ...updated,
      });

      toast.success('Profile updated successfully');
    } catch (x) {
      toast.error(getApiErrorMessage(x));
    } finally {
      setB1(false);
    }
  };

  // =========================================================
  // CHANGE PASSWORD
  // =========================================================

  const change = async (e) => {
    e.preventDefault();

    if (pw.new_password !== pw.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    setB2(true);

    try {
      await authService.changePassword(pw);

      toast.success('Password changed successfully');

      setPw({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (x) {
      toast.error(getApiErrorMessage(x));
    } finally {
      setB2(false);
    }
  };

  // =========================================================
  // FULL NAME
  // =========================================================

  const fullName =
    `${user?.first_name || ''} ${user?.last_name || ''}`.trim() ||
    user?.username ||
    'User';

  return (
    <div className="space-y-5">

      {/* =====================================================
          PREMIUM PROFILE HEADER
      ===================================================== */}

      <div
        className="
          overflow-hidden
          rounded-3xl
          bg-gradient-to-br
          from-slate-950
          via-indigo-950
          to-indigo-900
          p-6
          text-white
          shadow-xl
          shadow-indigo-900/10
          sm:p-8
        "
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

          {/* User Identity */}
          <div className="flex items-center gap-4">

            <div
              className="
                flex h-16 w-16
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-indigo-400
                to-violet-600
                text-2xl
                font-black
                text-white
                shadow-lg
                shadow-indigo-500/30
              "
            >
              {(
                user?.first_name?.[0] ||
                user?.username?.[0] ||
                'U'
              ).toUpperCase()}
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2">
                <UserRound size={15} className="text-indigo-300" />

                <span className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-300">
                  Account Profile
                </span>
              </div>

              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                {fullName}
              </h1>

              <p className="mt-1 text-sm text-indigo-200">
                @{user?.username}
              </p>
            </div>

          </div>

          {/* Role */}
          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-white/10
              bg-white/10
              px-4
              py-3
              backdrop-blur
            "
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <ShieldCheck size={19} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-300">
                Account Role
              </p>

              <p className="mt-0.5 text-sm font-bold text-white">
                {user?.role || 'User'}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* =====================================================
          ACCOUNT SUMMARY
      ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <Card className="group border-slate-200 p-4 transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <CircleUserRound size={19} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Username
              </p>

              <p className="truncate text-sm font-bold text-slate-800">
                @{user?.username || '—'}
              </p>
            </div>

          </div>
        </Card>

        <Card className="group border-slate-200 p-4 transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <Mail size={19} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Email
              </p>

              <p className="truncate text-sm font-bold text-slate-800">
                {user?.email || '—'}
              </p>
            </div>

          </div>
        </Card>

        <Card className="group border-slate-200 p-4 transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Phone size={19} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Phone
              </p>

              <p className="truncate text-sm font-bold text-slate-800">
                {user?.phone || 'Not added'}
              </p>
            </div>

          </div>
        </Card>

        <Card className="group border-slate-200 p-4 transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <ShieldCheck size={19} />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Status
              </p>

              <div className="mt-1">
                <Badge tone="green">
                  Active
                </Badge>
              </div>
            </div>

          </div>
        </Card>

      </div>

      {/* =====================================================
          PROFILE + PASSWORD
      ===================================================== */}

      <div className="grid gap-5 xl:grid-cols-2">

        {/* ===================================================
            PERSONAL DETAILS
        =================================================== */}

        <Card className="overflow-hidden p-0">

          {/* Header */}
          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5">

            <div className="flex items-center gap-3">

              <div
                className="
                  flex h-11 w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-indigo-100
                  text-indigo-600
                "
              >
                <UserRound size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Personal Details
                </h2>

                <p className="text-xs text-slate-500">
                  Update your account information.
                </p>
              </div>

            </div>

          </div>

          {/* Form */}
          <form
            onSubmit={save}
            className="space-y-4 p-5"
          >

            <div className="grid gap-4 sm:grid-cols-2">

              <Input
                label="First Name"
                value={p.first_name}
                onChange={(e) =>
                  setP({
                    ...p,
                    first_name: e.target.value,
                  })
                }
              />

              <Input
                label="Last Name"
                value={p.last_name}
                onChange={(e) =>
                  setP({
                    ...p,
                    last_name: e.target.value,
                  })
                }
              />

            </div>

            <div>

              <div className="mb-2 flex items-center gap-2">
                <Mail
                  size={14}
                  className="text-slate-400"
                />

                <span className="text-xs font-semibold text-slate-500">
                  Email Address
                </span>
              </div>

              <Input
                type="email"
                value={p.email}
                onChange={(e) =>
                  setP({
                    ...p,
                    email: e.target.value,
                  })
                }
              />

            </div>

            <div>

              <div className="mb-2 flex items-center gap-2">
                <Phone
                  size={14}
                  className="text-slate-400"
                />

                <span className="text-xs font-semibold text-slate-500">
                  Phone Number
                </span>
              </div>

              <Input
                value={p.phone}
                onChange={(e) =>
                  setP({
                    ...p,
                    phone: e.target.value,
                  })
                }
              />

            </div>

            {/* Account Role */}
            <div
              className="
                flex
                items-center
                justify-between
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-4
                py-3
              "
            >
              <div className="flex items-center gap-3">

                <ShieldCheck
                  size={18}
                  className="text-indigo-600"
                />

                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    Account Role
                  </p>

                  <p className="text-sm font-bold text-slate-800">
                    {user?.role || 'User'}
                  </p>
                </div>

              </div>

              <Badge tone="blue">
                {user?.role || 'USER'}
              </Badge>
            </div>

            {/* Submit */}
            <div className="border-t border-slate-100 pt-4">

              <Button
                type="submit"
                loading={b1}
                className="w-full sm:w-auto"
              >
                <Save size={16} />
                Update Profile
              </Button>

            </div>

          </form>
        </Card>

        {/* ===================================================
            CHANGE PASSWORD
        =================================================== */}

        <Card className="overflow-hidden p-0">

          {/* Header */}
          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5">

            <div className="flex items-center gap-3">

              <div
                className="
                  flex h-11 w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-amber-100
                  text-amber-600
                "
              >
                <LockKeyhole size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Change Password
                </h2>

                <p className="text-xs text-slate-500">
                  Keep your account secure with a strong password.
                </p>
              </div>

            </div>

          </div>

          {/* Password Form */}
          <form
            onSubmit={change}
            className="space-y-4 p-5"
          >

            {/* Security Notice */}
            <div
              className="
                flex
                gap-3
                rounded-xl
                border
                border-amber-100
                bg-amber-50
                p-4
                text-sm
                text-amber-800
              "
            >
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-semibold">
                  Password security
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-700">
                  Use a strong password that is difficult to
                  guess and avoid reusing passwords from other
                  accounts.
                </p>
              </div>

            </div>

            <Input
              label="Current Password"
              type="password"
              required
              value={pw.old_password}
              onChange={(e) =>
                setPw({
                  ...pw,
                  old_password: e.target.value,
                })
              }
            />

            <Input
              label="New Password"
              type="password"
              required
              value={pw.new_password}
              onChange={(e) =>
                setPw({
                  ...pw,
                  new_password: e.target.value,
                })
              }
            />

            <Input
              label="Confirm New Password"
              type="password"
              required
              value={pw.confirm_password}
              onChange={(e) =>
                setPw({
                  ...pw,
                  confirm_password: e.target.value,
                })
              }
            />

            {/* Password Match */}
            {pw.confirm_password && (
              <div
                className={`
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  p-3
                  text-xs
                  font-medium
                  ${
                    pw.new_password ===
                    pw.confirm_password
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                  }
                `}
              >
                <CheckCircle2 size={15} />

                {pw.new_password ===
                pw.confirm_password
                  ? 'Passwords match'
                  : 'Passwords do not match'}
              </div>
            )}

            {/* Submit */}
            <div className="border-t border-slate-100 pt-4">

              <Button
                type="submit"
                loading={b2}
                className="w-full sm:w-auto"
              >
                <KeyRound size={16} />
                Change Password
              </Button>

            </div>

          </form>
        </Card>

      </div>

      {/* =====================================================
          SECURITY FOOTER
      ===================================================== */}

      <div
        className="
          flex
          flex-col
          gap-3
          rounded-2xl
          border
          border-indigo-100
          bg-indigo-50
          p-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
            <ShieldCheck size={18} />
          </div>

          <div>
            <p className="text-sm font-bold text-indigo-900">
              Account Security
            </p>

            <p className="text-xs text-indigo-700">
              Your profile and password are managed securely.
            </p>
          </div>

        </div>

        <Badge tone="green">
          Account Active
        </Badge>

      </div>

    </div>
  );
}